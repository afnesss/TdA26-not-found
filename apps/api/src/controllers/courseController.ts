import { eq, asc } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db";
import { courseMaterials, courses } from "../db/schema";

export async function getAllCourses(_req: Request, res: Response) {
  const allCourses = await db
    .select({
      uuid: courses.uuid,
      name: courses.name,
      description: courses.description,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses);

  res.json(allCourses);
}

export async function getCourseByUuid(req: Request, res: Response) {
  const { courseId } = req.params;

  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, courseId));

  if (course.length === 0) {
    res.status(404).json({ message: "The requested resource was not found." });
    return;
  }

  // Fetch materials for this course (without file content for performance)
    const materials = await db
      .select({
        uuid: courseMaterials.uuid,
        type: courseMaterials.type,
        name: courseMaterials.name,
        description: courseMaterials.description,
        url: courseMaterials.url,
        mimeType: courseMaterials.mimeType,
        originalFilename: courseMaterials.originalFilename,
        createdAt: courseMaterials.createdAt,
      })
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, course[0].uuid))
      .orderBy(asc(courseMaterials.createdAt));

  res.json({
    course: {
      uuid: course[0].uuid,
      name: course[0].name,
      description: course[0].description,
    },
    materials: materials,
  });
}

export async function createCourse(req: Request, res: Response) {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ message: "Name is required" });
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
  const { courseId } = req.params;
  const { name, description } = req.body;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, courseId));

  if (existing.length === 0) {
    res.status(404).json({ message: "The requested resource was not found." });
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
    .where(eq(courses.uuid, courseId))
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
  const { courseId } = req.params;

  const existing = await db
    .select()
    .from(courses)
    .where(eq(courses.uuid, courseId));

  if (existing.length === 0) {
    res.status(404).json({ message: "The requested resource was not found." });
    return;
  }

  await db.delete(courses).where(eq(courses.uuid, courseId));

  res.status(204).send();
}
