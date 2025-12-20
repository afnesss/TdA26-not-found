import { and, asc, eq } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db";
import { courseMaterials } from "../db/schema";
import {
  fileMaterialBaseSchema,
  isValidUrl,
  linkMaterialSchema,
} from "../utils/validation";

export async function getMaterialsByCourse(req: Request, res: Response) {
  const { courseId: courseUuid } = req.params;

  try {
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
      .where(eq(courseMaterials.courseId, courseUuid))
      .orderBy(asc(courseMaterials.createdAt));

    res.json({ materials: materials });
  } catch (error) {
    console.error("[getMaterialsByCourse] Error:", error);
    res.status(500).json({ message: "Failed to retrieve course materials" });
  }
}

export async function createMaterial(req: Request, res: Response) {
  const { courseId: courseUuid } = req.params;
  const file = req.file;

  try {
    if (file) {
      // === FILE UPLOAD ===
      const validation = fileMaterialBaseSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const { name, description } = validation.data;
      const base64Content = file.buffer.toString("base64");

      const result = await db
        .insert(courseMaterials)
        .values({
          courseId: courseUuid,
          type: "file",
          name: name,
          description: description,
          fileContent: base64Content,
          mimeType: file.mimetype,
        })
        .returning({
          uuid: courseMaterials.uuid,
          type: courseMaterials.type,
          name: courseMaterials.name,
          description: courseMaterials.description,
          url: courseMaterials.url,
          fileContent: courseMaterials.fileContent,
          mimeType: courseMaterials.mimeType,
          originalFilename: courseMaterials.originalFilename,
          createdAt: courseMaterials.createdAt,
          courseId: courseMaterials.courseId,
        });

      res.status(201).json(result[0]);
    } else if (req.body.url || req.body.type === "link") {
      // === LINK MATERIAL ===
      const validation = linkMaterialSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const { name, description, url } = validation.data;

      if (!isValidUrl(url)) {
        res.status(400).json({ message: "Invalid URL format" });
        return;
      }

      const result = await db
        .insert(courseMaterials)
        .values({
          courseId: courseUuid,
          type: "link",
          name: name,
          description: description,
          url: url,
        })
        .returning({
          uuid: courseMaterials.uuid,
          type: courseMaterials.type,
          name: courseMaterials.name,
          description: courseMaterials.description,
          url: courseMaterials.url,
          createdAt: courseMaterials.createdAt,
          courseId: courseMaterials.courseId,
        });

      res.status(201).json(result[0]);
    } else {
      res.status(400).json({ message: "Either file or url must be provided" });
    }
  } catch (error) {
    console.error("[createMaterial] Error:", error);
    res.status(500).json({ message: "Failed to create course material" });
  }
}

export async function updateMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;
  const file = req.file;

  try {
        const materialCheck = await db
          .select({ uuid: courseMaterials.uuid, type: courseMaterials.type })
          .from(courseMaterials)
          .where(
            and(
              eq(courseMaterials.uuid, materialId),
              eq(courseMaterials.courseId, courseUuid)
            )
          );
    
        if (materialCheck.length === 0) {
          return res
            .status(404)
            .json({
              message: "Material not found or doesn't belong to the course",
            });
        }
        const materialType = materialCheck[0].type;
        const updateData: Record<string, any> = {};
    
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description !== undefined)
          updateData.description = req.body.description || null;
    
        if (materialType === "file" && file) {
          updateData.fileContent = file.buffer.toString("base64");
          updateData.mimeType = file.mimetype;
          updateData.originalFilename = file.originalname;
        }
    
        if (materialType === "link" && req.body.url) {
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
    
        const updated = await db
          .update(courseMaterials)
          .set(updateData)
          .where(eq(courseMaterials.uuid, materialId))
          .returning({
            uuid: courseMaterials.uuid,
            type: courseMaterials.type,
            name: courseMaterials.name,
            description: courseMaterials.description,
            url: courseMaterials.url,
            mimeType: courseMaterials.mimeType,
            originalFilename: courseMaterials.originalFilename,
            createdAt: courseMaterials.createdAt,
            courseId: courseMaterials.courseId,
          });

    res.json(updated[0]);
  } catch (error: any) {
    console.error("[updateMaterial] Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;

  try {
    const existingMaterial = await db
      .select({ uuid: courseMaterials.uuid })
      .from(courseMaterials)
      .where(
        and(
          eq(courseMaterials.uuid, materialId),
          eq(courseMaterials.courseId, courseUuid)
        )
      );

    if (existingMaterial.length === 0) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    await db.delete(courseMaterials).where(eq(courseMaterials.uuid, materialId));

    res.status(204).send();
  } catch (error: any) {
    console.error("[deleteMaterial] Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export async function downloadMaterial(req: Request, res: Response) {
  const { courseId: courseUuid, materialId } = req.params;

  try {
    const result = await db
      .select({
        fileContent: courseMaterials.fileContent,
        mimeType: courseMaterials.mimeType,
        originalFilename: courseMaterials.originalFilename,
      })
      .from(courseMaterials)
      .where(
        and(
          eq(courseMaterials.uuid, materialId),
          eq(courseMaterials.courseId, courseUuid),
          eq(courseMaterials.type, "file")
        )
      );

    if (result.length === 0) {
      res.status(404).json({ message: "Material not found" });
      return;
    }

    const mat = result[0];
    if (!mat.fileContent) {
      res.status(404).json({ message: "File content not found" });
      return;
    }

    const buffer = Buffer.from(mat.fileContent, "base64");

    res.setHeader("Content-Type", mat.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${mat.originalFilename}"`
    );
    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (error: any) {
    console.error("[downloadMaterial] Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
