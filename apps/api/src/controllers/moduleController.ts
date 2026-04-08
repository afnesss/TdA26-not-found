import { Request, Response } from "express";
import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../db";
import {
  courseMaterials,
  modules,
  quizzes,
  quizSubmissions,
} from "../db/schema";
import { mapMaterial } from "./materialController";
import { ModuleReorderRequest } from "../schemas";
import { sseManager } from "../utils/sseManager";
import { createSystemEvent } from "../utils/systemEvent";
import { buildLocalizedField, getRequestLocale } from "../utils/i18n";
import { logger } from "../utils/logger";
import { localizeNameDescription, localizeTitleQuestions } from "../utils/localizedResponse";

const MODULE_STATUSES = new Set(["active", "passive"]);
const moduleSummarySelect = {
  uuid: modules.uuid,
  sourceLocale: modules.sourceLocale,
  name: modules.name,
  nameI18n: modules.nameI18n,
  description: modules.description,
  descriptionI18n: modules.descriptionI18n,
  status: modules.status,
  createdAt: modules.createdAt,
  updatedAt: modules.updatedAt,
};

async function getBoundaryModuleUuid(
  courseId: string,
  status: "active" | "passive",
  direction: "first" | "last",
) {
  const orderBy =
    direction === "first" ? asc(modules.position) : desc(modules.position);

  const [row] = await db
    .select({ uuid: modules.uuid })
    .from(modules)
    .where(and(eq(modules.status, status), eq(modules.courseId, courseId)))
    .orderBy(orderBy);

  return row?.uuid ?? null;
}

async function buildModuleDetail(moduleUuid: string) {
  const [fetchedModule] = await db
    .select({
      ...moduleSummarySelect,
      courseId: modules.courseId,
      position: modules.position,
    })
    .from(modules)
    .where(eq(modules.uuid, moduleUuid));

  if (!fetchedModule) {
    return null;
  }

  const fetchedMaterials = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.moduleId, moduleUuid))
    .orderBy(desc(courseMaterials.createdAt), desc(courseMaterials.uuid));

  const fetchedQuizzes = await db
    .select({
      uuid: quizzes.uuid,
      sourceLocale: quizzes.sourceLocale,
      title: quizzes.title,
      titleI18n: quizzes.titleI18n,
      difficulty: quizzes.difficulty,
      moduleId: quizzes.moduleId,
      questions: quizzes.questions,
      questionsI18n: quizzes.questionsI18n,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
        Number,
      ),
      averagePercentage: sql<number>`
        ROUND(
          AVG(
            CASE
              WHEN ${quizSubmissions.maxScore} > 0
              THEN CAST(${quizSubmissions.score} AS FLOAT)
                / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100
              ELSE NULL
            END
          )
        )
      `.mapWith(Number),
    })
    .from(quizzes)
    .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
    .where(eq(quizzes.moduleId, moduleUuid))
    .groupBy(quizzes.uuid)
    .orderBy(desc(quizzes.createdAt), desc(quizzes.uuid));

  return {
    ...fetchedModule,
    materials: fetchedMaterials.map(mapMaterial),
    quizzes: fetchedQuizzes,
  };
}

export async function getModules(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const locale = getRequestLocale(req);

    const moduleSummaries = await db
      .select(moduleSummarySelect)
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(
        asc(modules.position),
        asc(modules.createdAt),
        asc(modules.uuid),
      );

    res.json(moduleSummaries.map((module) => localizeNameDescription(module, locale)));
  } catch (error) {
    logger.error({ err: error }, "Module request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getModuleByUuid(req: Request, res: Response) {
  try {
    const { courseId, moduleId } = req.params;
    const locale = getRequestLocale(req);
    const detailedModule = await buildModuleDetail(moduleId);

    if (!detailedModule || detailedModule.courseId !== courseId) {
      return res.status(404).json({ message: "Modul nebyl nalezen" });
    }

    res.json({
      ...localizeNameDescription(detailedModule, locale),
      materials: detailedModule.materials.map((material) =>
        localizeNameDescription(material, locale),
      ),
      quizzes: detailedModule.quizzes.map((quiz) =>
        localizeTitleQuestions(quiz, locale),
      ),
    });
  } catch (error) {
    logger.error({ err: error }, "Module request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function createModule(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { name, description, status } = req.body as {
      name?: string;
      description?: string | null;
      status?: string;
    };
    const locale = getRequestLocale(req);
    const sourceLocale =
      req.body.sourceLocale === "cs" || req.body.sourceLocale === "en"
        ? req.body.sourceLocale
        : locale;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Zadejte prosím název modulu" });
    }

    if (status !== undefined && !MODULE_STATUSES.has(status)) {
      return res.status(400).json({ message: "Neplatný status modulu" });
    }

    const [newModule] = await db.transaction(async (tx) => {
      const [row] = await tx
        .select({
          maxPosition:
            sql<number>`coalesce(max(${modules.position}), 0)`.mapWith(Number),
        })
        .from(modules)
        .where(eq(modules.courseId, courseId));

      const nextPosition = (row?.maxPosition ?? 0) + 1;

      const [created] = await tx
        .insert(modules)
        .values({
          courseId,
          sourceLocale,
          name: name.trim(),
          nameI18n: buildLocalizedField(sourceLocale, name.trim(), req.body.nameI18n),
          description: description ?? null,
          descriptionI18n: buildLocalizedField(
            sourceLocale,
            description ?? null,
            req.body.descriptionI18n,
          ),
          status: status ?? "passive",
          position: nextPosition,
        })
        .returning(moduleSummarySelect);

      return [created];
    });

    res.status(201).json(localizeNameDescription(newModule, locale));
  } catch (error) {
    logger.error({ err: error }, "Module request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function updateModule(req: Request, res: Response) {
  try {
    const { courseId, moduleId } = req.params;
    const { name, description, status } = req.body as {
      name?: string;
      description?: string | null;
      status?: string;
    };
    const locale = getRequestLocale(req);

    const [existingModule] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.uuid, moduleId), eq(modules.courseId, courseId)));

    if (!existingModule) {
      return res.status(404).json({ message: "Modul nebyl nalezen" });
    }

    const sourceLocale =
      req.body.sourceLocale === "cs" || req.body.sourceLocale === "en"
        ? req.body.sourceLocale
        : existingModule.sourceLocale;

    if (name !== undefined && !name.trim()) {
      return res
        .status(400)
        .json({ message: "Název modulu nesmí být prázdný" });
    }

    if (status !== undefined && !MODULE_STATUSES.has(status)) {
      return res.status(400).json({ message: "Neplatný status modulu" });
    }

    if (status === "passive" && existingModule.status === "active") {
      const lastActiveModuleUuid = await getBoundaryModuleUuid(
        courseId,
        "active",
        "last",
      );

      if (!lastActiveModuleUuid || lastActiveModuleUuid !== existingModule.uuid) {
        return res.status(400).json({
          message: "Lze skrýt pouze poslední aktivní modul v kurzu",
        });
      }
    }
    if (status === "active" && existingModule.status === "passive") {
      const firstPassiveModuleUuid = await getBoundaryModuleUuid(
        courseId,
        "passive",
        "first",
      );

      if (
        !firstPassiveModuleUuid ||
        firstPassiveModuleUuid !== existingModule.uuid
      ) {
        return res.status(400).json({
          message: "Lze aktivovat pouze první skrytý modul v kurzu",
        });
      }
    }
    const [updatedModule] = await db
      .update(modules)
      .set({
        sourceLocale,
        name: name?.trim() ?? existingModule.name,
        nameI18n: buildLocalizedField(
          sourceLocale,
          name?.trim() ?? existingModule.name,
          req.body.nameI18n ?? existingModule.nameI18n,
        ),
        description:
          description !== undefined ? description : existingModule.description,
        descriptionI18n: buildLocalizedField(
          sourceLocale,
          description !== undefined ? description : existingModule.description,
          req.body.descriptionI18n ?? existingModule.descriptionI18n,
        ),
        status: status ?? existingModule.status,
        updatedAt: new Date(),
      })
      .where(and(eq(modules.uuid, moduleId), eq(modules.courseId, courseId)))
      .returning(moduleSummarySelect);

    const isStatusOnlyChange =
      status !== undefined && name === undefined && description === undefined;

    if (isStatusOnlyChange && status !== existingModule.status) {
      sseManager.broadcast(courseId, "module_activated", updatedModule);

      await createSystemEvent(
        courseId,
        status === "active"
          ? {
              en: `Module "${updatedModule.name}" was activated by the lecturer`,
              cs: `Modul "${updatedModule.name}" byl aktivován lektorem`,
            }
          : {
              en: `Module "${updatedModule.name}" was hidden by the lecturer`,
              cs: `Modul "${updatedModule.name}" byl skryt lektorem`,
            },
      );
    }

    res.json(localizeNameDescription(updatedModule, locale));
  } catch (error) {
    logger.error({ err: error }, "Module request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function deleteModule(req: Request, res: Response) {
  try {
    const { courseId, moduleId } = req.params;

    await db.transaction(async (tx) => {
      const [existingModule] = await tx
        .select()
        .from(modules)
        .where(and(eq(modules.uuid, moduleId), eq(modules.courseId, courseId)));

      if (!existingModule) {
        throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
      }

      await tx
        .delete(modules)
        .where(and(eq(modules.uuid, moduleId), eq(modules.courseId, courseId)));

      await tx
        .update(modules)
        .set({
          position: sql`${modules.position} - 1`,
        })
        .where(
          and(
            eq(modules.courseId, courseId),
            gt(modules.position, existingModule.position),
          ),
        );
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error?.code === "NOT_FOUND") {
      return res.status(404).json({ message: "Modul nebyl nalezen" });
    }

    logger.error({ err: error }, "Module request failed");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function reorderModules(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body as ModuleReorderRequest;

    const reorderedModules = await db.transaction(async (tx) => {
      await tx.execute(sql`
        select ${modules.uuid}
        from ${modules}
        where ${modules.courseId} = ${courseId}
        for update
      `);

      const rows = await tx
        .select({ uuid: modules.uuid })
        .from(modules)
        .where(eq(modules.courseId, courseId));

      const existingIds = rows.map((r) => r.uuid);
      const existingSet = new Set(existingIds);

      if (
        existingIds.length !== moduleIds.length ||
        !moduleIds.every((id) => existingSet.has(id))
      ) {
        throw Object.assign(new Error("INVALID_IDS"), { code: "INVALID_IDS" });
      }

      await tx
        .update(modules)
        .set({ position: sql`${modules.position} + 1000` })
        .where(eq(modules.courseId, courseId));

      for (let i = 0; i < moduleIds.length; i++) {
        await tx
          .update(modules)
          .set({ position: i + 1, updatedAt: new Date() })
          .where(
            and(eq(modules.uuid, moduleIds[i]), eq(modules.courseId, courseId)),
          );
      }

      return tx
        .select(moduleSummarySelect)
        .from(modules)
        .where(eq(modules.courseId, courseId))
        .orderBy(
          asc(modules.position),
          asc(modules.createdAt),
          asc(modules.uuid),
        );
    });

    return res.json(reorderedModules);
  } catch (error: any) {
    if (error?.code === "INVALID_IDS") {
      return res.status(400).json({ message: "Neplatný seznam modulů" });
    }

    logger.error({ err: error }, "Module request failed");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}
