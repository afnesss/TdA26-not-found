import { Request, Response } from "express";
import { db } from "../db";
import { courseMaterials } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import {
  FileMaterialCreateRequestSchema,
  UrlMaterialCreateRequestSchema,
  FileMaterialUpdateRequestSchema,
  UrlMaterialUpdateRequestSchema,
} from "../schemas/material";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads"); // Mounted to /app/uploads in Docker

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

const mapMaterial = (m: typeof courseMaterials.$inferSelect) => {
  const base = {
    uuid: m.uuid,
    name: m.name,
    description: m.description || undefined,
  };

  if (m.type === "file") {
    return {
      ...base,
      type: "file",
      fileUrl: m.fileUrl!,
      mimeType: m.mimeType || undefined,
      sizeBytes: m.sizeBytes || undefined,
    };
  } else {
    return {
      ...base,
      type: "url",
      url: m.url!,
      faviconUrl: m.faviconUrl || undefined,
    };
  }
};

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const materials = await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, courseId))
      .orderBy(desc(courseMaterials.createdAt));

    res.json(materials.map(mapMaterial));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper to move file (handles cross-device moves)
const moveFile = async (source: string, destination: string) => {
  try {
    await fs.rename(source, destination);
  } catch (error: any) {
    if (error.code === 'EXDEV') {
      await fs.copyFile(source, destination);
      await fs.unlink(source);
    } else {
      throw error;
    }
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { type } = req.body;

    if (type === "file") {
      // Validate request body
      // Note: req.body will contain text fields, req.file has the file
      const validation = FileMaterialCreateRequestSchema.safeParse(req.body);
      
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      if (!validation.success) {
        // Cleanup uploaded file if validation fails
        await fs.unlink(req.file.path).catch(console.error);
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
      }

      const { name, description } = validation.data;
      const file = req.file;

      // Generate UUID
      const id = uuidv4();
      const extension = path.extname(file.originalname);
      const newFilename = `${id}${extension}`;
      const newPath = path.join(UPLOAD_DIR, newFilename);

      // Move file to final destination
      await moveFile(file.path, newPath);

      // Construct public URL
      const protocol = req.protocol;
      const host = req.get("host"); 
      const fileUrl = `${protocol}://${host}/api/uploads/${newFilename}`;

      const [material] = await db
        .insert(courseMaterials)
        .values({
          uuid: id,
          courseId,
          type: "file",
          name,
          description,
          fileUrl,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          originalFilename: file.originalname,
        })
        .returning();

      res.status(201).json(mapMaterial(material));

    } else if (type === "url") {
      const validation = UrlMaterialCreateRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
      }

      const { name, description, url } = validation.data;
      
      // Fetch favicon
      let faviconUrl = null;
      try {
        const urlObj = new URL(url);
        faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      } catch (e) {
        console.error("Failed to parse URL for favicon", e);
      }

      const [material] = await db
        .insert(courseMaterials)
        .values({
          courseId,
          type: "url",
          name,
          description,
          url,
          faviconUrl,
        })
        .returning();

      res.status(201).json(mapMaterial(material));

    } else {
      return res.status(400).json({ message: "Invalid material type" });
    }

  } catch (error) {
    console.error(error);
    if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { courseId, materialId } = req.params;
    
    // Check if material exists
    const existing = await db.query.courseMaterials.findFirst({
        where: eq(courseMaterials.uuid, materialId),
    });

    if (!existing) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ message: "Material not found" });
    }
    
    if (existing.courseId !== courseId) {
         if (req.file) await fs.unlink(req.file.path).catch(() => {});
         return res.status(404).json({ message: "Material not found in this course" });
    }

    if (existing.type === 'file') {
        const validation = FileMaterialUpdateRequestSchema.safeParse(req.body);
         if (!validation.success) {
            if (req.file) await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
        }

        const { name, description } = validation.data;
        const updates: any = { name, description, updatedAt: new Date() };

        if (req.file) {
            // Delete old file
            if (existing.originalFilename && existing.fileUrl) {
                const oldFilename = existing.fileUrl.split('/').pop();
                if (oldFilename) {
                    await fs.unlink(path.join(UPLOAD_DIR, oldFilename)).catch(console.error);
                }
            }

            // Save new file
            const file = req.file;
            const extension = path.extname(file.originalname);
            const newFilename = `${materialId}${extension}`;
            const newPath = path.join(UPLOAD_DIR, newFilename);

            await moveFile(file.path, newPath);

            const protocol = req.protocol;
            const host = req.get("host");
            const fileUrl = `${protocol}://${host}/api/uploads/${newFilename}`;

            updates.fileUrl = fileUrl;
            updates.mimeType = file.mimetype;
            updates.sizeBytes = file.size;
            updates.originalFilename = file.originalname;
        }

        const [updated] = await db
            .update(courseMaterials)
            .set(updates)
            .where(eq(courseMaterials.uuid, materialId))
            .returning();
        
        res.json(mapMaterial(updated));

    } else {
        // URL
        const validation = UrlMaterialUpdateRequestSchema.safeParse(req.body);
         if (!validation.success) {
            return res.status(400).json({ message: "Invalid request data", errors: validation.error.format() });
        }
        
        const { name, description, url } = validation.data;
        const updates: any = { name, description, updatedAt: new Date() };

        if (url && url !== existing.url) {
            updates.url = url;
            try {
                const urlObj = new URL(url);
                updates.faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
            } catch (e) {
                updates.faviconUrl = null;
            }
        }

        const [updated] = await db
            .update(courseMaterials)
            .set(updates)
            .where(eq(courseMaterials.uuid, materialId))
            .returning();

        res.json(mapMaterial(updated));
    }

  } catch (error) {
    console.error(error);
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { courseId, materialId } = req.params;

     const existing = await db.query.courseMaterials.findFirst({
        where: eq(courseMaterials.uuid, materialId),
    });

    if (!existing) {
        return res.status(404).json({ message: "Material not found" });
    }

    if (existing.courseId !== courseId) {
        return res.status(404).json({ message: "Material not found in this course" });
    }

    if (existing.type === 'file' && existing.fileUrl) {
         const oldFilename = existing.fileUrl.split('/').pop();
         if (oldFilename) {
             await fs.unlink(path.join(UPLOAD_DIR, oldFilename)).catch(console.error);
         }
    }

    await db.delete(courseMaterials).where(eq(courseMaterials.uuid, materialId));

    res.status(204).send();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
