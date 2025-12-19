import { Request, Response } from "express";
import { db } from "../db";
import { courseMaterials, courses } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { linkMaterialSchema, fileMaterialBaseSchema, isValidUrl } from "../utils/validation";

// Helper: Get numeric course ID from UUID
async function getCourseIdByUuid(courseUuid: string): Promise<number | null> {
  try {
    const result = await db.select({ id: courses.id })
      .from(courses)
      .where(eq(courses.uuid, courseUuid))
      .limit(1);
    return result.length > 0 ? result[0].id : null;
  } catch (error) {
    console.error('[getCourseIdByUuid] Error:', error);
    return null;
  }
}

export async function getMaterialsByCourse(req: Request, res: Response) {
  const { courseId: courseUuid } = req.params;

  try {
    const numericCourseId = await getCourseIdByUuid(courseUuid);
    if (numericCourseId === null) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const result = await db.execute(sql`
      SELECT 
        id,
        type,
        name,
        description,
        url,
        mime_type as "mimeType",
        original_filename as "originalFilename",
        created_at as "createdAt"
      FROM course_materials
      WHERE course_id = ${numericCourseId}
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error: any) {
    console.error('[getMaterialsByCourse] Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function createMaterial(req: Request, res: Response) {
  const { courseId: courseUuid } = req.params;
  const file = req.file;

  try {
    const numericCourseId = await getCourseIdByUuid(courseUuid);
    if (numericCourseId === null) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (file) {
      // === FILE UPLOAD ===
      const validation = fileMaterialBaseSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ message: "Validation failed", errors: validation.error.issues });
        return;
      }

      const { name, description } = validation.data;
      const base64Content = file.buffer.toString('base64');

      const result = await db.execute(sql`
        INSERT INTO course_materials (course_id, type, name, description, url, file_content, mime_type, original_filename)
        VALUES (${numericCourseId}, 'file', ${name}, ${description}, NULL, ${base64Content}, ${file.mimetype}, ${file.originalname})
        RETURNING id, type, name, description, mime_type as "mimeType", original_filename as "originalFilename", created_at as "createdAt"
      `);

      res.status(201).json(result.rows[0]);

    } else if (req.body.url || req.body.type === 'link') {
      // === LINK MATERIAL ===
      const validation = linkMaterialSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ message: "Validation failed", errors: validation.error.issues });
        return;
      }

      const { name, description, url } = validation.data;

      if (!isValidUrl(url)) {
        res.status(400).json({ message: "Invalid URL format" });
        return;
      }

      const result = await db.execute(sql`
        INSERT INTO course_materials (course_id, type, name, description, url, file_content, mime_type, original_filename)
        VALUES (${numericCourseId}, 'link', ${name}, ${description}, ${url}, NULL, NULL, NULL)
        RETURNING id, type, name, description, url, created_at as "createdAt"
      `);

      res.status(201).json(result.rows[0]);

    } else {
      res.status(400).json({ message: "Either file or url must be provided" });
    }

  } catch (error: any) {
    console.error('[createMaterial] Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function updateMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;
  const file = req.file;

  try {
    const numericCourseId = await getCourseIdByUuid(courseUuid);
    if (numericCourseId === null) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const existingResult = await db.execute(sql`
      SELECT id, type FROM course_materials
      WHERE id = ${materialId}::uuid AND course_id = ${numericCourseId}
      LIMIT 1
    `);

    if (existingResult.rows.length === 0) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    const materialType = existingResult.rows[0].type;
    const updateData: Record<string, any> = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;

    if (materialType === 'file' && file) {
      updateData.fileContent = file.buffer.toString('base64');
      updateData.mimeType = file.mimetype;
      updateData.originalFilename = file.originalname;
    }

    if (materialType === 'link' && req.body.url) {
      if (!isValidUrl(req.body.url)) {
        res.status(400).json({ message: "Invalid URL format" });
        return;
      }
      updateData.url = req.body.url;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const updated = await db.update(courseMaterials)
      .set(updateData)
      .where(eq(courseMaterials.id, materialId))
      .returning({
        id: courseMaterials.id,
        type: courseMaterials.type,
        name: courseMaterials.name,
        description: courseMaterials.description,
        url: courseMaterials.url,
        mimeType: courseMaterials.mimeType,
        originalFilename: courseMaterials.originalFilename,
        createdAt: courseMaterials.createdAt,
      });

    res.json(updated[0]);
  } catch (error: any) {
    console.error('[updateMaterial] Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;

  try {
    const numericCourseId = await getCourseIdByUuid(courseUuid);
    if (numericCourseId === null) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const existingResult = await db.execute(sql`
      SELECT id FROM course_materials
      WHERE id = ${materialId}::uuid AND course_id = ${numericCourseId}
      LIMIT 1
    `);

    if (existingResult.rows.length === 0) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    await db.execute(sql`
      DELETE FROM course_materials WHERE id = ${materialId}::uuid
    `);

    res.status(204).send();
  } catch (error: any) {
    console.error('[deleteMaterial] Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function downloadMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;

  try {
    const numericCourseId = await getCourseIdByUuid(courseUuid);
    if (numericCourseId === null) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const result = await db.execute(sql`
      SELECT file_content, mime_type, original_filename
      FROM course_materials
      WHERE id = ${materialId}::uuid AND course_id = ${numericCourseId} AND type = 'file'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    const mat = result.rows[0] as any;
    if (!mat.file_content) {
      res.status(404).json({ message: "File content not found" });
      return;
    }

    const buffer = Buffer.from(mat.file_content, 'base64');

    res.setHeader('Content-Type', mat.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${mat.original_filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (error: any) {
    console.error('[downloadMaterial] Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
