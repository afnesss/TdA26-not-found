import { Request, Response } from "express";
import { db } from "../db";
import {
  courses,
  quizzes,
  quizSubmissions,
  courseMaterials,
  feedItems,
} from "../db/schema";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { mapMaterial } from "./materialController";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { sseManager } from "../utils/sseManager";
import { createSystemEvent } from "../utils/systemEvent";

export async function getAllCourses(_req: Request, res: Response) {
  const userView = _req.query.userView;
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
    })
    .from(courses)
    .where(userView ? inArray(courses.status, ["planned", "live"]) : undefined)
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
        status_history: courses.status_history,
        scheduledFor: courses.scheduledFor,
      })
      .from(courses)
      .where(eq(courses.uuid, uuid));

    if (course.length === 0) {
      res.status(404).json({ message: "Kurz nebyl nalezen" });
      return;
    }

    const fetchedQuizzes = await db
      .select({
        uuid: quizzes.uuid,
        title: quizzes.title,
        courseId: quizzes.courseId,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
          Number,
        ),
      })
      .from(quizzes)
      .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
      .where(eq(quizzes.courseId, uuid))
      .groupBy(quizzes.uuid)
      .orderBy(desc(quizzes.createdAt));

    const fetchedMaterials = await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, uuid))
      .orderBy(desc(courseMaterials.createdAt), desc(courseMaterials.uuid));

    const fetchedFeed = await db
      .select()
      .from(feedItems)
      .where(eq(feedItems.courseId, uuid))
      .orderBy(desc(feedItems.createdAt))
      .limit(15);

    res.json({
      ...course[0],
      materials: fetchedMaterials.map(mapMaterial),
      quizzes: fetchedQuizzes,
      feed: fetchedFeed,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(404).json({ message: "Kurz nebyl nalezen" });
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
      status_history: courses.status_history,
      scheduledFor: courses.scheduledFor,
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
      res.status(404).json({ message: "Kurz nebyl nalezen" });
      return;
    }

    const sourceMaterials = await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, uuid))
      .orderBy(desc(courseMaterials.createdAt), desc(courseMaterials.uuid));

    const sourceQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.courseId, uuid))
      .orderBy(desc(quizzes.createdAt), desc(quizzes.uuid));

    const clonedCourse = await db.transaction(async (tx) => {
      const [newCourse] = await tx
        .insert(courses)
        .values({
          name: `${sourceCourse.name}`,
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

      for (const material of sourceMaterials) {
        if (material.type === "file") {
          if (!material.fileUrl) {
            throw new Error("Zdrojový souborový material nemá fileUrl");
          }

          const materialId = uuidv4();
          const fileUrl = await copyMaterialFile(material.fileUrl, materialId);
          const filename = path.basename(fileUrl);
          copiedFilePaths.push(path.join(UPLOAD_DIR, filename));

          await tx.insert(courseMaterials).values({
            uuid: materialId,
            courseId: newCourse.uuid,
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
          courseId: newCourse.uuid,
          type: "url",
          name: material.name,
          description: material.description ?? null,
          url: material.url ?? null,
          faviconUrl: material.faviconUrl ?? null,
        });
      }

      for (const quiz of sourceQuizzes) {
        await tx.insert(quizzes).values({
          courseId: newCourse.uuid,
          title: quiz.title,
          questions: quiz.questions,
        });
      }

      return newCourse;
    });

    // await createSystemEvent(
    //   clonedCourse.uuid,
    //   `Kurz byl zkopirovan z "${sourceCourse.name}"`,
    // );

    sseManager.broadcast("courses", "course_upserted", clonedCourse);

    res.status(201).json(clonedCourse);
  } catch (error) {
    for (const filePath of copiedFilePaths) {
      await fs.unlink(filePath).catch(() => undefined);
    }
    console.error("Error cloning course:", error);
    res.status(500).json({ message: "Nepodarilo se zkopirovat kurz" });
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
  const isStatusChanged = status && status !== existing[0].status;
  const nextStatus = status ?? existing[0].status;
  const scheduleWasProvided = scheduledFor !== undefined;
  const nextScheduledForDate =
    scheduledFor === null
      ? null
      : scheduledFor !== undefined
        ? new Date(scheduledFor)
        : existing[0].scheduledFor;

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
      scheduledFor:
        nextStatus === "live"
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

export async function deleteCourse(req: Request, res: Response) {
  const { uuid } = req.params;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ message: "Kurz nebyl nalezen" });
    return;
  }

  await db.delete(courses).where(eq(courses.uuid, uuid));

  res.status(204).send();
}

export const streamCourses = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseManager.addClient("courses", res);
};
