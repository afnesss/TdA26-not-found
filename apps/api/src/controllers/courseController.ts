import { Request, Response } from "express";
import { db } from "../db";
import { courses } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getAllCourses(_req: Request, res: Response) {
  const allCourses = await db.select({
    uuid: courses.uuid,
    name: courses.name,
    description: courses.description,
    createdAt: courses.createdAt,
    updatedAt: courses.updatedAt,
  }).from(courses);

  res.json(allCourses);
}

export async function getCourseByUuid(req: Request, res: Response) {
  const { uuid } = req.params;

  const course = await db.select({
    uuid: courses.uuid,
    name: courses.name,
    description: courses.description,
    createdAt: courses.createdAt,
    updatedAt: courses.updatedAt,
  }).from(courses).where(eq(courses.uuid, uuid));

  if (course.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(course[0]);
}

export async function createCourse(req: Request, res: Response) {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const newCourse = await db.insert(courses).values({
    name,
    description: description || null,
  }).returning({
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

  const existing = await db.select().from(courses).where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const updated = await db.update(courses)
    .set({
      name: name ?? existing[0].name,
      description: description !== undefined ? description : existing[0].description,
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

  const existing = await db.select().from(courses).where(eq(courses.uuid, uuid));

  if (existing.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  await db.delete(courses).where(eq(courses.uuid, uuid));

  res.status(204).send();
}
