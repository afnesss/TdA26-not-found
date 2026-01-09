import { Request, Response } from "express";
import { db } from "../db";
import {
  courses,
  quizzes,
  quizSubmissions,
  courseMaterials,
  feedItems,
} from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getAllCourses(_req: Request, res: Response) {
  const allCourses = await db
    .select({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .orderBy(desc(courses.createdAt));

  res.json(allCourses);
}

export async function getCourseByUuid(req: Request, res: Response) {
  const { uuid } = req.params;

  const course = await db
    .select({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (course.length === 0) {
    res.status(404).json({ error: "Course not found" });
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
        Number
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
    .orderBy(desc(courseMaterials.createdAt));

  const fetchedFeed = await db
    .select()
    .from(feedItems)
    .where(eq(feedItems.courseId, uuid))
    .orderBy(desc(feedItems.createdAt));

  res.json({
    ...course[0],
    materials: fetchedMaterials,
    quizzes: fetchedQuizzes,
    feed: fetchedFeed,
  });
}

export async function createCourse(req: Request, res: Response) {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
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
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    });

  res.status(201).json(newCourse[0]);
}

export async function updateCourse(req: Request, res: Response) {
  const { uuid } = req.params;
  const { name, description } = req.body;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const updated = await db
    .update(courses)
    .set({
      name: name ?? existing[0].name,
      description:
        description !== undefined ? description : existing[0].description,
      updatedAt: new Date(),
    })
    .where(eq(courses.uuid, uuid))
    .returning({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    });

  res.json(updated[0]);
}

export async function deleteCourse(req: Request, res: Response) {
  const { uuid } = req.params;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  await db.delete(courses).where(eq(courses.uuid, uuid));

  res.status(204).send();
}
