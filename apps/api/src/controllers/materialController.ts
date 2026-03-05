import { Request, Response } from "express";
import { db } from "../db";
import { courseMaterials, modules } from "../db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  FileMaterialCreateRequestSchema,
  UrlMaterialCreateRequestSchema,
  FileMaterialUpdateRequestSchema,
  UrlMaterialUpdateRequestSchema,
  MaterialInteractionRequestSchema,
} from "../schemas/material";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sseManager } from "../utils/sseManager";
import { logger } from "../utils/logger";

const UPLOAD_DIR = path.join(process.cwd(), "uploads"); // Mounted to /app/uploads in Docker

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch((err) =>
  logger.error({ err }, "Failed to ensure upload directory"),
);

export const mapMaterial = (m: typeof courseMaterials.$inferSelect) => {
  const base = {
    uuid: m.uuid,
    name: m.name,
    description: m.description ?? undefined,
  };

  if (m.type === "file") {
    return {
      ...base,
      type: "file",
      fileUrl: m.fileUrl!,
      mimeType: m.mimeType ?? undefined,
      sizeBytes: m.sizeBytes ?? undefined,
      originalFilename: m.originalFilename ?? undefined,
      downloadCount: m.downloadCount,
    };
  } else {
    return {
      ...base,
      type: "url",
      url: m.url!,
      faviconUrl: m.faviconUrl ?? undefined,
      copyCount: m.copyCount,
      openCount: m.openCount,
    };
  }
};

const getMaterialByModuleAndId = async (moduleId: string, materialId: string) => {
  const [material] = await db
    .select()
    .from(courseMaterials)
    .where(
      and(
        eq(courseMaterials.moduleId, moduleId),
        eq(courseMaterials.uuid, materialId),
      ),
    );

  return material;
};

const getCourseIdByModuleId = async (moduleId: string) => {
  const [module] = await db
    .select({ courseId: modules.courseId })
    .from(modules)
    .where(eq(modules.uuid, moduleId));

  return module?.courseId;
};

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;

    const materials = await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.moduleId, moduleId))
      .orderBy(desc(courseMaterials.createdAt), desc(courseMaterials.uuid));

    res.json(materials.map(mapMaterial));
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

// Helper to move file (handles cross-device moves)
const moveFile = async (source: string, destination: string) => {
  try {
    await fs.rename(source, destination);
  } catch (error: any) {
    if (error.code === "EXDEV") {
      await fs.copyFile(source, destination);
      await fs.unlink(source);
    } else {
      throw error;
    }
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { type } = req.body;

    if (type === "file") {
      // Validate request body
      // Note: req.body will contain text fields, req.file has the file
      const validation = FileMaterialCreateRequestSchema.safeParse(req.body);

      if (!req.file) {
        return res.status(400).json({ message: "Soubor je povinný" });
      }

      if (!validation.success) {
        // Cleanup uploaded file if validation fails
        await fs.unlink(req.file.path).catch((err) => logger.warn({ err }, "Failed to cleanup uploaded file"));
        return res.status(400).json({
          message: "Zkontrolujte prosím zadané údaje",
          errors: validation.error.format(),
        });
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

      // Construct public URL (Relative path)
      const fileUrl = `/api/uploads/${newFilename}`;

      const [material] = await db
        .insert(courseMaterials)

        .values({
          uuid: id,
          moduleId,
          type: "file",
          name,
          description,
          fileUrl,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          originalFilename: file.originalname,
        })
        .returning();

      // await createSystemEvent(courseId, `Přidán nový materiál: ${name}`);

      const mappedMaterial = mapMaterial(material);
      // sseManager.broadcast(courseId, "material_added", mappedMaterial);

      res.status(201).json(mappedMaterial);
    } else if (type === "url") {
      const validation = UrlMaterialCreateRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Zkontrolujte prosím zadané údaje",
          errors: validation.error.format(),
        });
      }

      const { name, description, url } = validation.data;

      // Fetch favicon
      let faviconUrl = null;
      try {
        const urlObj = new URL(url);
        faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      } catch (e) {
        logger.warn({ err: e }, "Failed to parse URL for favicon");
      }

      const [material] = await db
        .insert(courseMaterials)
        .values({
          moduleId,
          type: "url",
          name,
          description,
          url,
          faviconUrl,
        })
        .returning();

      // await createSystemEvent(courseId, `Přidán nový materiál: ${name}`);

      const mappedMaterial = mapMaterial(material);
      // sseManager.broadcast(courseId, "material_added", mappedMaterial);

      res.status(201).json(mappedMaterial);
    } else {
      return res.status(400).json({ message: "Neplatný typ materiálu" });
    }
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { moduleId, materialId } = req.params;

    // Check if material exists
    const existing = await db.query.courseMaterials.findFirst({
      where: eq(courseMaterials.uuid, materialId),
    });

    if (!existing) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: "Materiál nebyl nalezen" });
    }

    if (existing.moduleId !== moduleId) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res
        .status(404)
        .json({ message: "Materiál v tomto kurzu neexistuje" });
    }

    if (existing.type === "file") {
      const validation = FileMaterialUpdateRequestSchema.safeParse(req.body);
      if (!validation.success) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({
          message: "Zkontrolujte prosím zadané údaje",
          errors: validation.error.format(),
        });
      }

      const { name, description } = validation.data;
      const updates: any = { name, description, updatedAt: new Date() };

      if (req.file) {
        // Delete old file
        if (existing.fileUrl) {
          const oldFilename = existing.fileUrl.split("/").pop();
          if (oldFilename) {
            await fs
              .unlink(path.join(UPLOAD_DIR, oldFilename))
              .catch((err) => logger.warn({ err }, "Failed to remove file"));
          }
        }

        // Save new file
        const file = req.file;
        const extension = path.extname(file.originalname);
        const newFilename = `${materialId}${extension}`;
        const newPath = path.join(UPLOAD_DIR, newFilename);

        await moveFile(file.path, newPath);

        const fileUrl = `/api/uploads/${newFilename}`;

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

      // await createSystemEvent(
      //   courseId,
      //   `Materiál aktualizován: ${updated.name}`,
      // );

      const mappedUpdated = mapMaterial(updated);
      // sseManager.broadcast(courseId, "material_updated", mappedUpdated);

      res.json(mappedUpdated);
    } else {
      // URL
      const validation = UrlMaterialUpdateRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Zkontrolujte prosím zadané údaje",
          errors: validation.error.format(),
        });
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

      // await createSystemEvent(
      //   courseId,
      //   `Materiál aktualizován: ${updated.name}`,
      // );

      const mappedUpdated = mapMaterial(updated);
      // sseManager.broadcast(courseId, "material_updated", mappedUpdated);

      res.json(mappedUpdated);
    }
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const trackMaterialInteraction = async (req: Request, res: Response) => {
  try {
    const { moduleId, materialId } = req.params;
    const validation = MaterialInteractionRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Neplatný požadavek",
        errors: validation.error.format(),
      });
    }

    const material = await getMaterialByModuleAndId(moduleId, materialId);
    if (!material) {
      return res.status(404).json({ message: "Materiál nebyl nalezen" });
    }

    const updates: {
      updatedAt: Date;
      downloadCount?: any;
      copyCount?: any;
      openCount?: any;
    } = {
      updatedAt: new Date(),
    };

    const { action } = validation.data;
    if (action === "download") {
      if (material.type !== "file") {
        return res
          .status(400)
          .json({ message: "Akce download je jen pro soubor" });
      }
      updates.downloadCount = sql`${courseMaterials.downloadCount} + 1`;
    } else if (action === "copy") {
      if (material.type !== "url") {
        return res.status(400).json({ message: "Akce copy je jen pro URL" });
      }
      updates.copyCount = sql`${courseMaterials.copyCount} + 1`;
    } else {
      if (material.type !== "url") {
        return res.status(400).json({ message: "Akce open je jen pro URL" });
      }
      updates.openCount = sql`${courseMaterials.openCount} + 1`;
    }

    const [updatedMaterial] = await db
      .update(courseMaterials)
      .set(updates)
      .where(eq(courseMaterials.uuid, materialId))
      .returning();

    const courseId = await getCourseIdByModuleId(moduleId);
    if (courseId) {
      const payload = {
        courseId,
        moduleId,
        material: mapMaterial(updatedMaterial),
      };
      sseManager.broadcast(courseId, "material_interaction_updated", payload);
      sseManager.broadcast("courses", "material_interaction_updated", payload);
      sseManager.broadcast(courseId, "material_updated", payload);
      sseManager.broadcast("courses", "material_updated", payload);
    }

    return res.json(mapMaterial(updatedMaterial));
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const downloadMaterial = async (req: Request, res: Response) => {
  try {
    const { moduleId, materialId } = req.params;
    const material = await getMaterialByModuleAndId(moduleId, materialId);

    if (!material) {
      return res.status(404).json({ message: "Materiál nebyl nalezen" });
    }

    if (material.type !== "file" || !material.fileUrl) {
      return res
        .status(400)
        .json({ message: "Tento materiál není dostupný ke stažení" });
    }

    const [updatedMaterial] = await db
      .update(courseMaterials)
      .set({
        downloadCount: sql`${courseMaterials.downloadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(courseMaterials.uuid, materialId))
      .returning();

    const courseId = await getCourseIdByModuleId(moduleId);
    if (courseId) {
      const payload = {
        courseId,
        moduleId,
        material: mapMaterial(updatedMaterial),
      };
      sseManager.broadcast(courseId, "material_interaction_updated", payload);
      sseManager.broadcast("courses", "material_interaction_updated", payload);
      sseManager.broadcast(courseId, "material_updated", payload);
      sseManager.broadcast("courses", "material_updated", payload);
    }

    return res.redirect(material.fileUrl);
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { moduleId, materialId } = req.params;

    const existing = await db.query.courseMaterials.findFirst({
      where: eq(courseMaterials.uuid, materialId),
    });

    if (!existing) {
      return res.status(404).json({ message: "Materiál nebyl nalezen" });
    }

    if (existing.moduleId !== moduleId) {
      return res
        .status(404)
        .json({ message: "Materiál v tomto kurzu neexistuje" });
    }

    if (existing.type === "file" && existing.fileUrl) {
      const oldFilename = existing.fileUrl.split("/").pop();
      if (oldFilename) {
        await fs
          .unlink(path.join(UPLOAD_DIR, oldFilename))
          .catch((err) => logger.warn({ err }, "Failed to remove file"));
      }
    }

    await db
      .delete(courseMaterials)
      .where(eq(courseMaterials.uuid, materialId));

    // await createSystemEvent(courseId, `Materiál odebrán: ${existing.name}`);

    // sseManager.broadcast(courseId, "material_deleted", { uuid: materialId });

    res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, "Material request failed");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};


