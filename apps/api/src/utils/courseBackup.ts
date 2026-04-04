import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import {
  courseMaterials,
  courses,
  feedItems,
  modules,
  organizations,
  quizSubmissions,
  quizzes,
} from "../db/schema";
import {
  type CourseBackup,
  CourseBackupSchema,
  type CoursesBackupCollection,
  CoursesBackupCollectionSchema,
  type CourseDashboardAnalytics,
} from "../schemas/course";
import { mapMaterial } from "../controllers/materialController";
import {
  buildLocalizedField,
  buildLocalizedQuestions,
} from "./i18n";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

class CourseImportConflictError extends Error {
  status = 409;

  constructor(message: string) {
    super(message);
    this.name = "CourseImportConflictError";
  }
}

const toDate = (value: string | Date | null | undefined) =>
  value == null ? null : value instanceof Date ? value : new Date(value);

const serializeDate = (value: string | Date | null | undefined) =>
  value == null ? null : value instanceof Date ? value.toISOString() : value;

const withLocalizedText = (
  value: string | null | undefined,
  sourceLocale: "cs" | "en" = "cs",
) => ({
  ...(value != null ? { [sourceLocale]: value } : {}),
});

const getDefaultOrganizationId = async () => {
  const [organization] = await db
    .select({ uuid: organizations.uuid })
    .from(organizations)
    .where(eq(organizations.slug, "tda"));

  if (!organization) {
    throw new Error("Default TdA organization was not found");
  }

  return organization.uuid;
};

type DashboardModuleAnalyticsRow = CourseDashboardAnalytics["modules"][number];
const COURSE_STATUSES = [
  "draft",
  "planned",
  "live",
  "paused",
  "archived",
] as const;

const buildEmptyAnalyticsSnapshot = (backup: {
  course: { uuid: string };
  modules: Array<{
    uuid: string;
    name: string;
    status: "active" | "passive";
    materials: Array<{ type: "file" | "url" }>;
    quizzes: Array<unknown>;
  }>;
}): CourseDashboardAnalytics => {
  const modules = backup.modules.map((module) => {
    const fileMaterialsCount = module.materials.filter(
      (material) => material.type === "file",
    ).length;
    const urlMaterialsCount = module.materials.length - fileMaterialsCount;

    return {
      uuid: module.uuid,
      name: module.name,
      status: module.status,
      materialsCount: module.materials.length,
      fileMaterialsCount,
      urlMaterialsCount,
      quizzesCount: module.quizzes.length,
      quizzesWithoutSubmits: module.quizzes.length,
      interactions: 0,
      downloadCount: 0,
      copyCount: 0,
      openCount: 0,
      quizAttempts: 0,
      averageQuizPercentage: null,
      lowScoreQuizzes: 0,
    };
  });

  return {
    courseId: backup.course.uuid,
    modulesCount: modules.length,
    materialsCount: modules.reduce(
      (sum, module) => sum + module.materialsCount,
      0,
    ),
    quizzesCount: modules.reduce((sum, module) => sum + module.quizzesCount, 0),
    quizzesWithoutSubmits: modules.reduce(
      (sum, module) => sum + module.quizzesWithoutSubmits,
      0,
    ),
    interactions: 0,
    downloadCount: 0,
    copyCount: 0,
    openCount: 0,
    averageQuizPercentage: null,
    modulesWithoutInteraction: modules.length,
    lowScoreQuizzes: 0,
    modules,
  };
};

const normalizeSingleBackup = (input: unknown): CourseBackup => {
  const currentBackup = CourseBackupSchema.safeParse(input);
  if (currentBackup.success) {
    return currentBackup.data;
  }

  const legacy = input as {
    exportedAt?: string;
    course?: {
      uuid: string;
      name: string;
      description?: string | null;
      status: "draft" | "planned" | "live" | "paused" | "archived";
      createdAt: string;
      updatedAt: string;
      startedAt?: string | null;
      scheduledFor?: string | null;
      status_history?: Array<{
        status: string;
        timestamp: string;
        note?: string;
      }>;
      feed?: Array<{
        uuid: string;
        type: "manual" | "system";
        message: string;
        edited?: boolean;
        createdAt: string;
        updatedAt?: string;
      }>;
      modules?: Array<{
        uuid: string;
        name: string;
        description?: string | null;
        status: "active" | "passive";
        createdAt?: string;
        updatedAt?: string;
        position?: number;
        materials?: Array<any>;
        quizzes?: Array<any>;
      }>;
    };
  };

  if (!legacy?.course || !Array.isArray(legacy.course.modules)) {
    throw new Error("Neplatny format zalohy");
  }

  const normalizedBackup: CourseBackup = {
    version: 2 as const,
    exportedAt: legacy.exportedAt ?? new Date().toISOString(),
    course: {
      uuid: legacy.course.uuid,
      sourceLocale: "cs",
      name: legacy.course.name,
      nameI18n: withLocalizedText(legacy.course.name),
      description: legacy.course.description ?? null,
      descriptionI18n: withLocalizedText(legacy.course.description ?? null),
      status: legacy.course.status,
      createdAt: legacy.course.createdAt,
      updatedAt: legacy.course.updatedAt,
      startedAt: legacy.course.startedAt ?? null,
      scheduledFor: legacy.course.scheduledFor ?? null,
      status_history: (legacy.course.status_history ?? []).filter((event) =>
        COURSE_STATUSES.includes(
          event.status as (typeof COURSE_STATUSES)[number],
        ),
      ) as CourseBackup["course"]["status_history"],
    },
    modules: legacy.course.modules.map((module, index) => ({
      uuid: module.uuid,
      sourceLocale: "cs" as const,
      name: module.name,
      nameI18n: withLocalizedText(module.name),
      description: module.description ?? null,
      descriptionI18n: withLocalizedText(module.description ?? null),
      status: module.status,
      position: module.position ?? index + 1,
      createdAt: module.createdAt ?? legacy.course!.createdAt,
      updatedAt: module.updatedAt ?? legacy.course!.updatedAt,
      materials: module.materials ?? [],
      quizzes: (module.quizzes ?? []).map((quiz: any) => {
        const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
        return {
          ...quiz,
          sourceLocale: "cs" as const,
          titleI18n: withLocalizedText(quiz.title),
          questionsI18n: buildLocalizedQuestions("cs", questions),
          uuid: quiz.uuid,
          createdAt: quiz.createdAt ?? legacy.course!.createdAt,
          updatedAt: quiz.updatedAt ?? legacy.course!.updatedAt,
        };
      }),
    })),
    feed: (legacy.course.feed ?? []).map((item) => ({
      ...item,
      sourceLocale: "cs" as const,
      messageI18n: withLocalizedText(item.message),
    })),
    quizSubmissions: [],
    files: [],
    analyticsSnapshot: buildEmptyAnalyticsSnapshot({
      course: { uuid: legacy.course.uuid },
      modules: [],
    }),
  };

  normalizedBackup.analyticsSnapshot =
    buildEmptyAnalyticsSnapshot(normalizedBackup);
  return CourseBackupSchema.parse(normalizedBackup);
};

export async function getCourseDashboardAnalyticsData(
  uuid: string,
): Promise<CourseDashboardAnalytics | null> {
  const [existingCourse] = await db
    .select({ uuid: courses.uuid, status: courses.status })
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (!existingCourse) {
    return null;
  }

  const courseModules = await db
    .select({
      uuid: modules.uuid,
      name: modules.name,
      status: modules.status,
    })
    .from(modules)
    .where(eq(modules.courseId, uuid))
    .orderBy(asc(modules.position), asc(modules.createdAt), asc(modules.uuid));

  if (courseModules.length === 0) {
    return {
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
    };
  }

  const moduleIds = courseModules.map((module) => module.uuid);

  const [materialStats, quizStats] = await Promise.all([
    db
      .select({
        moduleId: courseMaterials.moduleId,
        materialsCount: sql<number>`count(*)`.mapWith(Number),
        fileMaterialsCount: sql<number>`
          count(case when ${courseMaterials.type} = 'file' then 1 else null end)
        `.mapWith(Number),
        urlMaterialsCount: sql<number>`
          count(case when ${courseMaterials.type} = 'url' then 1 else null end)
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

  const moduleAnalytics: DashboardModuleAnalyticsRow[] = courseModules.map(
    (module) => {
      const material = materialStatsByModule.get(module.uuid);
      const quiz = quizStatsByModule.get(module.uuid);

      const materialsCount = material?.materialsCount ?? 0;
      const materialInteractions = material?.materialInteractions ?? 0;
      const quizAttempts = quiz?.quizAttempts ?? 0;

      return {
        uuid: module.uuid,
        name: module.name,
        status: module.status as DashboardModuleAnalyticsRow["status"],
        materialsCount,
        fileMaterialsCount: material?.fileMaterialsCount ?? 0,
        urlMaterialsCount: material?.urlMaterialsCount ?? 0,
        quizzesCount: quiz?.quizzesCount ?? 0,
        quizzesWithoutSubmits: quiz?.quizzesWithoutSubmits ?? 0,
        interactions: materialInteractions + quizAttempts,
        downloadCount: material?.downloadCount ?? 0,
        copyCount: material?.copyCount ?? 0,
        openCount: material?.openCount ?? 0,
        quizAttempts,
        averageQuizPercentage: quiz?.averageQuizPercentage ?? null,
        lowScoreQuizzes: quiz?.lowScoreQuizzes ?? 0,
      };
    },
  );

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

  return {
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
  };
}

export async function buildCourseBackup(
  uuid: string,
  organizationId?: string,
): Promise<CourseBackup | null> {
  const [course] = await db
    .select({
      uuid: courses.uuid,
      sourceLocale: courses.sourceLocale,
      name: courses.name,
      nameI18n: courses.nameI18n,
      description: courses.description,
      descriptionI18n: courses.descriptionI18n,
      status: courses.status,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      startedAt: courses.startedAt,
      scheduledFor: courses.scheduledFor,
      status_history: courses.status_history,
    })
    .from(courses)
    .where(
      organizationId
        ? and(
            eq(courses.uuid, uuid),
            eq(courses.organizationId, organizationId),
          )
        : eq(courses.uuid, uuid),
    );

  if (!course) {
    return null;
  }

  const baseModules = await db
    .select({
      uuid: modules.uuid,
      sourceLocale: modules.sourceLocale,
      name: modules.name,
      nameI18n: modules.nameI18n,
      description: modules.description,
      descriptionI18n: modules.descriptionI18n,
      status: modules.status,
      position: modules.position,
      createdAt: modules.createdAt,
      updatedAt: modules.updatedAt,
    })
    .from(modules)
    .where(eq(modules.courseId, uuid))
    .orderBy(asc(modules.position), asc(modules.createdAt), asc(modules.uuid));

  const moduleIds = baseModules.map((module) => module.uuid);

  const [materialRows, quizRows, feed, analytics] = await Promise.all([
    moduleIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(courseMaterials)
          .where(inArray(courseMaterials.moduleId, moduleIds))
          .orderBy(asc(courseMaterials.createdAt), asc(courseMaterials.uuid)),
    moduleIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(quizzes)
          .where(inArray(quizzes.moduleId, moduleIds))
          .orderBy(asc(quizzes.createdAt), asc(quizzes.uuid)),
    db
      .select()
      .from(feedItems)
      .where(eq(feedItems.courseId, uuid))
      .orderBy(asc(feedItems.createdAt), asc(feedItems.uuid)),
    getCourseDashboardAnalyticsData(uuid),
  ]);

  const quizIds = quizRows.map((quiz) => quiz.uuid);
  const submissions =
    quizIds.length === 0
      ? []
      : await db
          .select()
          .from(quizSubmissions)
          .where(inArray(quizSubmissions.quizId, quizIds))
          .orderBy(asc(quizSubmissions.createdAt), asc(quizSubmissions.uuid));

  const materialsByModule = new Map<string, ReturnType<typeof mapMaterial>[]>();
  for (const material of materialRows) {
    const list = materialsByModule.get(material.moduleId) ?? [];
    list.push(mapMaterial(material));
    materialsByModule.set(material.moduleId, list);
  }

  const quizzesByModule = new Map<string, typeof quizRows>();
  for (const quiz of quizRows) {
    const list = quizzesByModule.get(quiz.moduleId) ?? [];
    list.push(quiz);
    quizzesByModule.set(quiz.moduleId, list);
  }

  const files = await Promise.all(
    materialRows
      .filter((material) => material.type === "file" && material.fileUrl)
      .map(async (material) => {
        const sourcePath = path.join(
          UPLOAD_DIR,
          path.basename(material.fileUrl as string),
        );
        const fileBuffer = await fs.readFile(sourcePath);
        return {
          materialUuid: material.uuid,
          originalFilename:
            material.originalFilename ??
            path.basename(material.fileUrl as string),
          mimeType: material.mimeType,
          base64: fileBuffer.toString("base64"),
        };
      }),
  );

  return CourseBackupSchema.parse({
    version: 2,
    exportedAt: new Date().toISOString(),
    course: {
      ...course,
      createdAt: serializeDate(course.createdAt),
      updatedAt: serializeDate(course.updatedAt),
      startedAt: serializeDate(course.startedAt),
      scheduledFor: serializeDate(course.scheduledFor),
    },
    modules: baseModules.map((module) => ({
      ...module,
      status: module.status,
      createdAt: serializeDate(module.createdAt),
      updatedAt: serializeDate(module.updatedAt),
      materials: materialsByModule.get(module.uuid) ?? [],
      quizzes: (quizzesByModule.get(module.uuid) ?? []).map((quiz) => ({
        ...quiz,
        createdAt: serializeDate(quiz.createdAt),
        updatedAt: serializeDate(quiz.updatedAt),
      })),
    })),
    feed: feed.map((item) => ({
      ...item,
      createdAt: serializeDate(item.createdAt),
      updatedAt: serializeDate(item.updatedAt),
    })),
    quizSubmissions: submissions.map((submission) => ({
      quizUuid: submission.quizId,
      score: submission.score,
      maxScore: submission.maxScore,
      answers: submission.answers,
      createdAt: serializeDate(submission.createdAt),
    })),
    files,
    analyticsSnapshot: analytics,
  });
}

export async function buildAllCoursesBackup(
  organizationId?: string,
): Promise<CoursesBackupCollection> {
  const allCourses = await db
    .select({ uuid: courses.uuid })
    .from(courses)
    .where(
      organizationId ? eq(courses.organizationId, organizationId) : undefined,
    )
    .orderBy(desc(courses.createdAt), desc(courses.uuid));

  const backups = (
    await Promise.all(
      allCourses.map((course) => buildCourseBackup(course.uuid)),
    )
  ).filter((course): course is CourseBackup => Boolean(course));

  return CoursesBackupCollectionSchema.parse({
    version: 2,
    exportedAt: new Date().toISOString(),
    scope: "all-courses",
    courses: backups,
  });
}

const escapeCsvValue = (value: string) =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function buildCourseExportCsv(backup: CourseBackup) {
  const headers = [
    "courseName",
    "courseStatus",
    "moduleName",
    "moduleStatus",
    "materialName",
    "materialType",
    "materialDownloads",
    "materialOpens",
    "materialCopies",
    "quizTitle",
    "quizDifficulty",
    "quizAttempts",
    "quizAveragePercentage",
    "moduleInteractions",
    "courseAverageQuizPercentage",
  ];

  const rows: string[][] = [];

  for (const module of backup.modules) {
    const moduleAnalytics =
      backup.analyticsSnapshot.modules.find(
        (item) => item.uuid === module.uuid,
      ) ?? null;
    const materialCount = Math.max(1, module.materials.length);
    const quizCount = Math.max(1, module.quizzes.length);
    const rowCount = Math.max(materialCount, quizCount);

    for (let index = 0; index < rowCount; index++) {
      const material = module.materials[index];
      const quiz = module.quizzes[index];

      rows.push([
        backup.course.name,
        backup.course.status,
        module.name,
        module.status,
        material?.name ?? "",
        material?.type ?? "",
        material?.type === "file" ? String(material.downloadCount ?? 0) : "",
        material?.type === "url" ? String(material.openCount ?? 0) : "",
        material?.type === "url" ? String(material.copyCount ?? 0) : "",
        quiz?.title ?? "",
        quiz?.difficulty ?? "",
        String(quiz?.attemptsCount ?? 0),
        quiz?.averagePercentage == null ? "" : String(quiz.averagePercentage),
        String(moduleAnalytics?.interactions ?? 0),
        backup.analyticsSnapshot.averageQuizPercentage == null
          ? ""
          : String(backup.analyticsSnapshot.averageQuizPercentage),
      ]);
    }
  }

  if (rows.length === 0) {
    rows.push([
      backup.course.name,
      backup.course.status,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "0",
      backup.analyticsSnapshot.averageQuizPercentage == null
        ? ""
        : String(backup.analyticsSnapshot.averageQuizPercentage),
    ]);
  }

  return [
    headers.join(","),
    ...rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")),
  ].join("\n");
}

export async function importCourseBackup(
  input: unknown,
  options?: { includeStatistics?: boolean; organizationId?: string },
) {
  const backup = normalizeSingleBackup(input);
  const createdFilePaths: string[] = [];
  const includeStatistics = options?.includeStatistics ?? false;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const organizationId =
      options?.organizationId ?? (await getDefaultOrganizationId());

    const [existingCourse] = await db
      .select({
        uuid: courses.uuid,
        name: courses.name,
        organizationId: courses.organizationId,
      })
      .from(courses)
      .where(eq(courses.uuid, backup.course.uuid));

    if (existingCourse?.organizationId === organizationId) {
      throw new CourseImportConflictError(
        `Kurz s ID ${backup.course.uuid} už existuje`,
      );
    }

    const importedCourseUuid = existingCourse ? uuidv4() : backup.course.uuid;

    const importedCourse = await db.transaction(async (tx) => {
      const [newCourse] = await tx
        .insert(courses)
        .values({
          uuid: importedCourseUuid,
          organizationId,
          sourceLocale: backup.course.sourceLocale ?? "cs",
          name: backup.course.name,
          nameI18n:
            backup.course.nameI18n ??
            buildLocalizedField(
              backup.course.sourceLocale ?? "cs",
              backup.course.name,
            ),
          description: backup.course.description ?? null,
          descriptionI18n:
            backup.course.descriptionI18n ??
            buildLocalizedField(
              backup.course.sourceLocale ?? "cs",
              backup.course.description ?? null,
            ),
          status: backup.course.status,
          shareToken: null,
          shareTokenUpdatedAt: null,
          createdAt: toDate(backup.course.createdAt) ?? new Date(),
          updatedAt: toDate(backup.course.updatedAt) ?? new Date(),
          startedAt: toDate(backup.course.startedAt),
          scheduledFor: toDate(backup.course.scheduledFor),
          status_history: backup.course.status_history ?? [],
        })
        .returning({
          uuid: courses.uuid,
          sourceLocale: courses.sourceLocale,
          name: courses.name,
          nameI18n: courses.nameI18n,
          description: courses.description,
          descriptionI18n: courses.descriptionI18n,
          status: courses.status,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
          startedAt: courses.startedAt,
          scheduledFor: courses.scheduledFor,
          status_history: courses.status_history,
        });

      const moduleIdMap = new Map<string, string>();
      const quizIdMap = new Map<string, string>();
      const fileMap = new Map(
        backup.files.map((file) => [file.materialUuid, file]),
      );

      for (const module of backup.modules) {
        const moduleId = uuidv4();
        moduleIdMap.set(module.uuid, moduleId);

        await tx.insert(modules).values({
          uuid: moduleId,
          courseId: newCourse.uuid,
          sourceLocale: module.sourceLocale ?? backup.course.sourceLocale ?? "cs",
          name: module.name,
          nameI18n:
            module.nameI18n ??
            buildLocalizedField(
              module.sourceLocale ?? backup.course.sourceLocale ?? "cs",
              module.name,
            ),
          description: module.description ?? null,
          descriptionI18n:
            module.descriptionI18n ??
            buildLocalizedField(
              module.sourceLocale ?? backup.course.sourceLocale ?? "cs",
              module.description ?? null,
            ),
          status: module.status,
          position: module.position,
          createdAt: toDate(module.createdAt) ?? new Date(),
          updatedAt: toDate(module.updatedAt) ?? new Date(),
        });

        for (const material of module.materials) {
          if (material.type === "file") {
            const materialId = uuidv4();
            const fileRecord = fileMap.get(material.uuid);
            if (!fileRecord) {
              if (!material.fileUrl) {
                throw new Error(
                  `Missing file payload for material ${material.uuid}`,
                );
              }

              await tx.insert(courseMaterials).values({
                uuid: materialId,
                moduleId,
                sourceLocale:
                  material.sourceLocale ??
                  module.sourceLocale ??
                  backup.course.sourceLocale ??
                  "cs",
                type: "file",
                name: material.name,
                nameI18n:
                  material.nameI18n ??
                  buildLocalizedField(
                    material.sourceLocale ??
                      module.sourceLocale ??
                      backup.course.sourceLocale ??
                      "cs",
                    material.name,
                  ),
                description: material.description ?? null,
                descriptionI18n:
                  material.descriptionI18n ??
                  buildLocalizedField(
                    material.sourceLocale ??
                      module.sourceLocale ??
                      backup.course.sourceLocale ??
                      "cs",
                    material.description ?? null,
                  ),
                fileUrl: material.fileUrl,
                mimeType: material.mimeType ?? null,
                sizeBytes: material.sizeBytes ?? null,
                originalFilename: material.originalFilename ?? null,
                downloadCount: includeStatistics
                  ? (material.downloadCount ?? 0)
                  : 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              continue;
            }

            const extension = path.extname(fileRecord.originalFilename);
            const fileName = `${materialId}${extension}`;
            const targetPath = path.join(UPLOAD_DIR, fileName);

            await fs.writeFile(
              targetPath,
              Buffer.from(fileRecord.base64, "base64"),
            );
            createdFilePaths.push(targetPath);

            await tx.insert(courseMaterials).values({
              uuid: materialId,
              moduleId,
              sourceLocale:
                material.sourceLocale ??
                module.sourceLocale ??
                backup.course.sourceLocale ??
                "cs",
              type: "file",
              name: material.name,
              nameI18n:
                material.nameI18n ??
                buildLocalizedField(
                  material.sourceLocale ??
                    module.sourceLocale ??
                    backup.course.sourceLocale ??
                    "cs",
                  material.name,
                ),
              description: material.description ?? null,
              descriptionI18n:
                material.descriptionI18n ??
                buildLocalizedField(
                  material.sourceLocale ??
                    module.sourceLocale ??
                    backup.course.sourceLocale ??
                    "cs",
                  material.description ?? null,
                ),
              fileUrl: `/api/uploads/${fileName}`,
              mimeType: material.mimeType ?? fileRecord.mimeType ?? null,
              sizeBytes: material.sizeBytes ?? null,
              originalFilename:
                material.originalFilename ?? fileRecord.originalFilename,
              downloadCount: includeStatistics
                ? (material.downloadCount ?? 0)
                : 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            continue;
          }

          await tx.insert(courseMaterials).values({
            uuid: uuidv4(),
            moduleId,
            sourceLocale:
              material.sourceLocale ??
              module.sourceLocale ??
              backup.course.sourceLocale ??
              "cs",
            type: "url",
            name: material.name,
            nameI18n:
              material.nameI18n ??
              buildLocalizedField(
                material.sourceLocale ??
                  module.sourceLocale ??
                  backup.course.sourceLocale ??
                  "cs",
                material.name,
              ),
            description: material.description ?? null,
            descriptionI18n:
              material.descriptionI18n ??
              buildLocalizedField(
                material.sourceLocale ??
                  module.sourceLocale ??
                  backup.course.sourceLocale ??
                  "cs",
                material.description ?? null,
              ),
            url: material.url,
            faviconUrl: material.faviconUrl ?? null,
            copyCount: includeStatistics ? (material.copyCount ?? 0) : 0,
            openCount: includeStatistics ? (material.openCount ?? 0) : 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        for (const quiz of module.quizzes) {
          const quizId = uuidv4();
          quizIdMap.set(quiz.uuid ?? "", quizId);

          await tx.insert(quizzes).values({
            uuid: quizId,
            moduleId,
            sourceLocale: quiz.sourceLocale ?? module.sourceLocale ?? "cs",
            title: quiz.title,
            titleI18n:
              quiz.titleI18n ??
              buildLocalizedField(
                quiz.sourceLocale ?? module.sourceLocale ?? "cs",
                quiz.title,
              ),
            difficulty: quiz.difficulty,
            questions: quiz.questions,
            questionsI18n:
              quiz.questionsI18n ??
              buildLocalizedQuestions(
                quiz.sourceLocale ?? module.sourceLocale ?? "cs",
                quiz.questions,
              ),
            createdAt: toDate(quiz.createdAt) ?? new Date(),
            updatedAt: toDate(quiz.updatedAt) ?? new Date(),
          });
        }
      }

      if (includeStatistics) {
        for (const submission of backup.quizSubmissions) {
          const mappedQuizId = quizIdMap.get(submission.quizUuid);
          if (!mappedQuizId) {
            continue;
          }

          await tx.insert(quizSubmissions).values({
            uuid: uuidv4(),
            quizId: mappedQuizId,
            score: submission.score,
            maxScore: submission.maxScore,
            answers: submission.answers,
            createdAt: toDate(submission.createdAt) ?? new Date(),
          });
        }
      }

      for (const item of backup.feed) {
        await tx.insert(feedItems).values({
          uuid: uuidv4(),
          courseId: newCourse.uuid,
          sourceLocale: item.sourceLocale ?? backup.course.sourceLocale ?? "cs",
          type: item.type,
          message: item.message,
          messageI18n:
            item.messageI18n ??
            buildLocalizedField(
              item.sourceLocale ?? backup.course.sourceLocale ?? "cs",
              item.message,
            ),
          edited: item.edited,
          createdAt: toDate(item.createdAt) ?? new Date(),
          updatedAt: toDate(item.updatedAt) ?? new Date(),
        });
      }

      return newCourse;
    });

    return importedCourse;
  } catch (error) {
    await Promise.all(
      createdFilePaths.map((filePath) =>
        fs.unlink(filePath).catch(() => undefined),
      ),
    );
    throw error;
  }
}

export async function importAllCoursesBackup(
  input: unknown,
  options?: { organizationId?: string },
) {
  const parsedCollection = CoursesBackupCollectionSchema.safeParse(input);
  const backupCollection = parsedCollection.success
    ? parsedCollection.data
    : (() => {
        const legacy = input as {
          exportedAt?: string;
          scope?: string;
          courses?: unknown[];
        };

        return CoursesBackupCollectionSchema.parse({
          version: 2,
          exportedAt: legacy.exportedAt ?? new Date().toISOString(),
          scope: "all-courses",
          courses: Array.isArray(legacy.courses)
            ? legacy.courses.map((course) => normalizeSingleBackup(course))
            : [],
        });
      })();
  const importedCourses = [];
  const includeStatistics = backupCollection.courses.length > 1;
  const duplicateCourseIdsInBackup = backupCollection.courses.reduce<
    Map<string, number>
  >((acc, courseBackup) => {
    acc.set(
      courseBackup.course.uuid,
      (acc.get(courseBackup.course.uuid) ?? 0) + 1,
    );
    return acc;
  }, new Map());

  const repeatedCourseIds = [...duplicateCourseIdsInBackup.entries()]
    .filter(([, count]) => count > 1)
    .map(([uuid]) => uuid);

  if (repeatedCourseIds.length > 0) {
    throw new CourseImportConflictError(
      `V záloze se opakuje ID kurzu: ${repeatedCourseIds.join(", ")}`,
    );
  }

  for (const courseBackup of backupCollection.courses) {
    const importedCourse = await importCourseBackup(courseBackup, {
      includeStatistics,
      organizationId: options?.organizationId,
    });
    importedCourses.push(importedCourse);
  }

  return importedCourses;
}
