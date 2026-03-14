import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import {
  courseMaterials,
  courses,
  feedItems,
  modules,
  quizSubmissions,
  quizzes,
} from "../db/schema";
import { mapMaterial } from "./materialController";

import { sseManager } from "../utils/sseManager";
import { logger } from "../utils/logger";

export async function getAllCourses(req: Request, res: Response) {
  const userView = String(req.query.userView ?? "").toLowerCase() === "true";

  const allCourses = await db
    .select({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      status: courses.status,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      startedAt: courses.startedAt,
      scheduledFor: courses.scheduledFor,
      status_history: courses.status_history,
    })
    .from(courses)
    .where(
      userView
        ? inArray(courses.status, ["planned", "live", "paused"])
        : undefined,
    )
    .orderBy(desc(courses.createdAt), desc(courses.uuid));

  res.json(allCourses);
}

export async function getCourseByUuid(req: Request, res: Response) {
  try {
    const { uuid } = req.params;

    const course = await db
      .select({
        uuid: courses.uuid,
        name: courses.name,
        description: courses.description,
        status: courses.status,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        startedAt: courses.startedAt,
        scheduledFor: courses.scheduledFor,
        status_history: courses.status_history,
      })
      .from(courses)
      .where(eq(courses.uuid, uuid));

    if (course.length === 0) {
      res.status(404).json({ message: "Kurz nebyl nalezen" });
      return;
    }

    const baseModules = await db
      .select({
        uuid: modules.uuid,
        name: modules.name,
        description: modules.description,
        status: modules.status,
        position: modules.position,
        courseId: modules.courseId,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
      })
      .from(modules)
      .where(eq(modules.courseId, uuid))
      .orderBy(
        asc(modules.position),
        asc(modules.createdAt),
        asc(modules.uuid),
      );

    const fetchedModules = await Promise.all(
      baseModules.map(async (module) => {
        const [fetchedMaterials, fetchedQuizzes] = await Promise.all([
          db
            .select()
            .from(courseMaterials)
            .where(eq(courseMaterials.moduleId, module.uuid))
            .orderBy(
              desc(courseMaterials.createdAt),
              desc(courseMaterials.uuid),
            ),
          db
            .select({
              uuid: quizzes.uuid,
              title: quizzes.title,
              moduleId: quizzes.moduleId,
              questions: quizzes.questions,
              createdAt: quizzes.createdAt,
              updatedAt: quizzes.updatedAt,
              attemptsCount:
                sql<number>`count(${quizSubmissions.uuid})`.mapWith(Number),
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
            .where(eq(quizzes.moduleId, module.uuid))
            .groupBy(quizzes.uuid)
            .orderBy(desc(quizzes.createdAt), desc(quizzes.uuid)),
        ]);

        return {
          ...module,
          materials: fetchedMaterials.map(mapMaterial),
          quizzes: fetchedQuizzes,
        };
      }),
    );

    const fetchedFeed = await db
      .select()
      .from(feedItems)
      .where(eq(feedItems.courseId, uuid))
      .orderBy(desc(feedItems.createdAt))
      .limit(15);

    res.json({
      ...course[0],

      modules: fetchedModules,
      feed: fetchedFeed,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch course");
    res.status(404).json({ message: "Kurz nebyl nalezen" });
  }
}

export async function getCourseDashboardAnalytics(req: Request, res: Response) {
  try {
    const { uuid } = req.params;

    const [existingCourse] = await db
      .select({ uuid: courses.uuid, status: courses.status })
      .from(courses)
      .where(eq(courses.uuid, uuid));

    if (!existingCourse) {
      return res.status(404).json({ message: "Kurz nebyl nalezen" });
    }

    if (!["live", "paused", "archived"].includes(existingCourse.status)) {
      return res.status(404).json({ message: "Statistiky nejsou dostupné" });
    }

    const courseModules = await db
      .select({
        uuid: modules.uuid,
        name: modules.name,
        status: modules.status,
      })
      .from(modules)
      .where(eq(modules.courseId, uuid))
      .orderBy(
        asc(modules.position),
        asc(modules.createdAt),
        asc(modules.uuid),
      );

    if (courseModules.length === 0) {
      return res.json({
        courseId: uuid,
        modulesCount: 0,
        materialsCount: 0,
        quizzesCount: 0,
        quizzesWithoutSubmits: 0,
        interactions: 0,
        downloadCount: 0,
        copyCount: 0,
        openCount: 0,
        averageQuizPercentage: null,
        modulesWithoutInteraction: 0,
        lowScoreQuizzes: 0,
        modules: [],
      });
    }

    const moduleIds = courseModules.map((module) => module.uuid);

    const [materialStats, quizStats] = await Promise.all([
      db
        .select({
          moduleId: courseMaterials.moduleId,
          materialsCount: sql<number>`count(*)`.mapWith(Number),
          fileMaterialsCount: sql<number>`
              count(
                case when ${courseMaterials.type} = 'file' then 1 else null end
              )
            `.mapWith(Number),
          urlMaterialsCount: sql<number>`
              count(
                case when ${courseMaterials.type} = 'url' then 1 else null end
              )
            `.mapWith(Number),
          downloadCount:
            sql<number>`coalesce(sum(${courseMaterials.downloadCount}), 0)`.mapWith(
              Number,
            ),
          copyCount:
            sql<number>`coalesce(sum(${courseMaterials.copyCount}), 0)`.mapWith(
              Number,
            ),
          openCount:
            sql<number>`coalesce(sum(${courseMaterials.openCount}), 0)`.mapWith(
              Number,
            ),
          materialInteractions: sql<number>`
            coalesce(
              sum(
                case
                  when ${courseMaterials.type} = 'file'
                  then ${courseMaterials.downloadCount}
                  else ${courseMaterials.copyCount} + ${courseMaterials.openCount}
                end
              ),
              0
            )
          `.mapWith(Number),
        })
        .from(courseMaterials)
        .where(inArray(courseMaterials.moduleId, moduleIds))
        .groupBy(courseMaterials.moduleId),
      db
        .select({
          moduleId: quizzes.moduleId,
          quizzesCount: sql<number>`count(distinct ${quizzes.uuid})`.mapWith(
            Number,
          ),
          quizAttempts: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
            Number,
          ),
          averageQuizPercentage: sql<number>`
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
          lowScoreQuizzes: sql<number>`
              count(
                distinct case
                  when ${quizSubmissions.maxScore} > 0
                    and (
                      CAST(${quizSubmissions.score} AS FLOAT)
                      / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100
                    ) < 60
                  then ${quizzes.uuid}
                  else null
                end
              )
            `.mapWith(Number),
          quizzesWithoutSubmits: sql<number>`
              count(
                distinct case
                  when ${quizSubmissions.uuid} is null
                  then ${quizzes.uuid}
                  else null
                end
              )
            `.mapWith(Number),
        })
        .from(quizzes)
        .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
        .where(inArray(quizzes.moduleId, moduleIds))
        .groupBy(quizzes.moduleId),
    ]);

    const materialStatsByModule = new Map(
      materialStats.map((row) => [row.moduleId, row]),
    );
    const quizStatsByModule = new Map(
      quizStats.map((row) => [row.moduleId, row]),
    );

    const moduleAnalytics = courseModules.map((module) => {
      const material = materialStatsByModule.get(module.uuid);
      const quiz = quizStatsByModule.get(module.uuid);

      const materialsCount = material?.materialsCount ?? 0;
      const fileMaterialsCount = material?.fileMaterialsCount ?? 0;
      const urlMaterialsCount = material?.urlMaterialsCount ?? 0;
      const materialInteractions = material?.materialInteractions ?? 0;
      const downloadCount = material?.downloadCount ?? 0;
      const copyCount = material?.copyCount ?? 0;
      const openCount = material?.openCount ?? 0;
      const quizzesCount = quiz?.quizzesCount ?? 0;
      const quizzesWithoutSubmits = quiz?.quizzesWithoutSubmits ?? 0;
      const quizAttempts = quiz?.quizAttempts ?? 0;
      const interactions = materialInteractions + quizAttempts;

      return {
        uuid: module.uuid,
        name: module.name,
        status: module.status,
        materialsCount,
        fileMaterialsCount,
        urlMaterialsCount,
        quizzesCount,
        quizzesWithoutSubmits,
        interactions,
        downloadCount,
        copyCount,
        openCount,
        quizAttempts,
        averageQuizPercentage: quiz?.averageQuizPercentage ?? null,
        lowScoreQuizzes: quiz?.lowScoreQuizzes ?? 0,
      };
    });

    const totals = moduleAnalytics.reduce(
      (acc, module) => {
        acc.materialsCount += module.materialsCount;
        acc.quizzesCount += module.quizzesCount;
        acc.quizzesWithoutSubmits += module.quizzesWithoutSubmits;
        acc.interactions += module.interactions;
        acc.downloadCount += module.downloadCount;
        acc.copyCount += module.copyCount;
        acc.openCount += module.openCount;
        acc.modulesWithoutInteraction += module.interactions === 0 ? 1 : 0;
        acc.lowScoreQuizzes += module.lowScoreQuizzes;
        if (module.averageQuizPercentage != null && module.quizAttempts > 0) {
          acc.quizWeightedSum +=
            module.averageQuizPercentage * module.quizAttempts;
          acc.quizAttempts += module.quizAttempts;
        }
        return acc;
      },
      {
        materialsCount: 0,
        quizzesCount: 0,
        quizzesWithoutSubmits: 0,
        interactions: 0,
        downloadCount: 0,
        copyCount: 0,
        openCount: 0,
        modulesWithoutInteraction: 0,
        lowScoreQuizzes: 0,
        quizWeightedSum: 0,
        quizAttempts: 0,
      },
    );

    return res.json({
      courseId: uuid,
      modulesCount: moduleAnalytics.length,
      materialsCount: totals.materialsCount,
      quizzesCount: totals.quizzesCount,
      quizzesWithoutSubmits: totals.quizzesWithoutSubmits,
      interactions: totals.interactions,
      downloadCount: totals.downloadCount,
      copyCount: totals.copyCount,
      openCount: totals.openCount,
      averageQuizPercentage:
        totals.quizAttempts > 0
          ? Math.round(totals.quizWeightedSum / totals.quizAttempts)
          : null,
      modulesWithoutInteraction: totals.modulesWithoutInteraction,
      lowScoreQuizzes: totals.lowScoreQuizzes,
      modules: moduleAnalytics,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch dashboard analytics");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function createCourse(req: Request, res: Response) {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ message: "Zadejte prosím název kurzu" });
    return;
  }

  const newCourse = await db
    .insert(courses)
    .values({
      name,
      description: description || null,
    })
    .returning({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      status: courses.status,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      startedAt: courses.startedAt,
      scheduledFor: courses.scheduledFor,
      status_history: courses.status_history,
    });

  res.status(201).json(newCourse[0]);
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const copyMaterialFile = async (
  sourceUrl: string,
  targetMaterialId: string,
) => {
  const sourceFilename = path.basename(sourceUrl);
  const sourcePath = path.join(UPLOAD_DIR, sourceFilename);
  const extension = path.extname(sourceFilename);
  const targetFilename = `${targetMaterialId}${extension}`;
  const targetPath = path.join(UPLOAD_DIR, targetFilename);

  await fs.copyFile(sourcePath, targetPath);
  return `/api/uploads/${targetFilename}`;
};

export async function cloneCourse(req: Request, res: Response) {
  const { uuid } = req.params;
  const copiedFilePaths: string[] = [];

  try {
    const [sourceCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.uuid, uuid));

    if (!sourceCourse) {
      return res.status(404).json({ message: "Kurz nebyl nalezen" });
    }

    const sourceModules = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, uuid))
      .orderBy(
        asc(modules.position),
        asc(modules.createdAt),
        asc(modules.uuid),
      );

    const sourceModuleIds = sourceModules.map((m) => m.uuid);

    const sourceMaterials =
      sourceModuleIds.length === 0
        ? []
        : await db
            .select()
            .from(courseMaterials)
            .where(inArray(courseMaterials.moduleId, sourceModuleIds))
            .orderBy(
              desc(courseMaterials.createdAt),
              desc(courseMaterials.uuid),
            );

    const sourceQuizzes =
      sourceModuleIds.length === 0
        ? []
        : await db
            .select()
            .from(quizzes)
            .where(inArray(quizzes.moduleId, sourceModuleIds))
            .orderBy(desc(quizzes.createdAt), desc(quizzes.uuid));

    const clonedCourse = await db.transaction(async (tx) => {
      const [newCourse] = await tx
        .insert(courses)
        .values({
          name: sourceCourse.name,
          description: sourceCourse.description ?? null,
          status: "draft",
          startedAt: null,
          scheduledFor: null,
          status_history: [],
        })
        .returning({
          uuid: courses.uuid,
          name: courses.name,
          description: courses.description,
          status: courses.status,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
          startedAt: courses.startedAt,
          status_history: courses.status_history,
          scheduledFor: courses.scheduledFor,
        });

      const moduleIdMap = new Map<string, string>();

      for (const sourceModule of sourceModules) {
        const [newModule] = await tx
          .insert(modules)
          .values({
            courseId: newCourse.uuid,
            name: sourceModule.name,
            description: sourceModule.description ?? null,
            status: sourceModule.status,
            position: sourceModule.position,
          })
          .returning({ uuid: modules.uuid });

        moduleIdMap.set(sourceModule.uuid, newModule.uuid);
      }

      for (const material of sourceMaterials) {
        const mappedModuleId = moduleIdMap.get(material.moduleId);
        if (!mappedModuleId) {
          continue;
        }

        if (material.type === "file") {
          if (!material.fileUrl) {
            throw new Error("Zdrojový souborový materiál nemá fileUrl");
          }

          const materialId = uuidv4();
          const fileUrl = await copyMaterialFile(material.fileUrl, materialId);
          const filename = path.basename(fileUrl);
          copiedFilePaths.push(path.join(UPLOAD_DIR, filename));

          await tx.insert(courseMaterials).values({
            uuid: materialId,
            moduleId: mappedModuleId,
            type: "file",
            name: material.name,
            description: material.description ?? null,
            fileUrl,
            mimeType: material.mimeType ?? null,
            sizeBytes: material.sizeBytes ?? null,
            originalFilename: material.originalFilename ?? null,
          });

          continue;
        }

        await tx.insert(courseMaterials).values({
          moduleId: mappedModuleId,
          type: "url",
          name: material.name,
          description: material.description ?? null,
          url: material.url ?? null,
          faviconUrl: material.faviconUrl ?? null,
        });
      }

      for (const quiz of sourceQuizzes) {
        const mappedModuleId = moduleIdMap.get(quiz.moduleId);
        if (!mappedModuleId) {
          continue;
        }

        await tx.insert(quizzes).values({
          moduleId: mappedModuleId,
          title: quiz.title,
          questions: quiz.questions,
        });
      }

      return newCourse;
    });

    sseManager.broadcast("courses", "course_upserted", clonedCourse);
    return res.status(201).json(clonedCourse);
  } catch (error) {
    for (const filePath of copiedFilePaths) {
      await fs.unlink(filePath).catch(() => undefined);
    }
    logger.error({ err: error }, "Failed to clone course");
    return res.status(500).json({ message: "Nepodařilo se zkopírovat kurz" });
  }
}

export async function updateCourse(req: Request, res: Response) {
  const { uuid } = req.params;
  const { name, description, status, scheduledFor } = req.body;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ message: "Kurz nebyl nalezen" });
    return;
  }
  const currentStatus = existing[0].status;
  const scheduleWasProvided = scheduledFor !== undefined;
  const nextScheduledForDate =
    scheduledFor === null
      ? null
      : scheduledFor !== undefined
        ? new Date(scheduledFor)
        : existing[0].scheduledFor;
  const nextStatus = status ?? currentStatus;
  const isStatusChanged = Boolean(status && status !== currentStatus);
  const shouldClearScheduleOnTransition =
    currentStatus === "planned" &&
    (nextStatus === "draft" || nextStatus === "live");

  const validationError = validateCourseUpdate({
    currentStatus,
    nextStatus,
    nextScheduledForDate,
    isStatusChanged,
  });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const updated = await db
    .update(courses)
    .set({
      name: name ?? existing[0].name,
      description:
        description !== undefined ? description : existing[0].description,
      status: status ?? existing[0].status,
      updatedAt: new Date(),
      startedAt:
        status === "live" && isStatusChanged
          ? new Date()
          : existing[0].startedAt,

      status_history:
        isStatusChanged && status
          ? [
              ...(existing[0].status_history ?? []),
              { status, timestamp: new Date().toISOString() },
            ]
          : existing[0].status_history,
      scheduledFor: shouldClearScheduleOnTransition
        ? null
        : nextStatus === "live"
          ? null
          : nextStatus === "planned"
            ? nextScheduledForDate
            : scheduleWasProvided
              ? nextScheduledForDate
              : existing[0].scheduledFor,
    })
    .where(eq(courses.uuid, uuid))
    .returning({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      status: courses.status,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      startedAt: courses.startedAt,
      status_history: courses.status_history,
      scheduledFor: courses.scheduledFor,
    });

  // Only create feed event if something other than status was changed
  const isOnlyStatusChange =
    status !== undefined && name === undefined && description === undefined;

  const wasUserVisible = ["planned", "live"].includes(existing[0].status);
  const isUserVisible = ["planned", "live"].includes(nextStatus);
  if ((!wasUserVisible && isUserVisible) || (wasUserVisible && isUserVisible)) {
    sseManager.broadcast("courses", "course_upserted", updated[0]);
  } else if (wasUserVisible && !isUserVisible) {
    sseManager.broadcast("courses", "course_removed", {
      uuid: updated[0].uuid,
      name: updated[0].name,
      status: updated[0].status,
    });
  }

  // if (!isOnlyStatusChange) {
  //   await createSystemEvent(uuid, `Detaily kurzu aktualizovány`);
  // }

  sseManager.broadcast(uuid, "course_updated", updated[0]);

  res.json(updated[0]);
}

type CourseUpdateValidation = {
  currentStatus: string;
  nextStatus: string;
  nextScheduledForDate: Date | null;
  isStatusChanged: boolean;
};

const validateCourseUpdate = ({
  currentStatus,
  nextStatus,
  nextScheduledForDate,
  isStatusChanged,
}: CourseUpdateValidation): string | null => {
  if (nextScheduledForDate && Number.isNaN(nextScheduledForDate.getTime())) {
    return "Neplatné datum naplánování";
  }

  if (nextScheduledForDate && nextScheduledForDate.getTime() < Date.now()) {
    return "Datum naplánování nesmí být v minulosti";
  }

  if (!isStatusChanged) {
    return null;
  }

  if (currentStatus === "archived") {
    return "Archivovaný kurz nelze měnit";
  }

  const transitions: Record<string, string[]> = {
    draft: ["planned", "live"],
    planned: ["draft", "live"],
    live: ["paused", "archived"],
    paused: ["live", "archived"],
    archived: [],
  };

  const allowedNext = transitions[currentStatus] ?? [];
  if (!allowedNext.includes(nextStatus)) {
    return "Neplatná změna stavu kurzu";
  }

  if (nextStatus === "planned" && !nextScheduledForDate) {
    return "Při plánování kurzu zadejte datum";
  }

  return null;
};

export async function deleteCourse(req: Request, res: Response) {
  try {
    const { uuid } = req.params;

    // Single atomic delete avoids race between "exists?" check and delete.
    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.uuid, uuid))
      .returning({
        uuid: courses.uuid,
        name: courses.name,
        status: courses.status,
      });

    // If nothing was deleted, the course did not exist.
    if (!deletedCourse) {
      return res.status(404).json({ message: "Kurz nebyl nalezen" });
    }

    sseManager.broadcast("courses", "course_removed", deletedCourse);
    sseManager.broadcast(deletedCourse.uuid, "course_removed", deletedCourse);
    return res.status(204).send();
  } catch (error) {
    // Explicit server error handling for DB/runtime failures.
    logger.error({ err: error }, "Failed to delete course");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export const streamCourses = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseManager.addClient("courses", res);
};
