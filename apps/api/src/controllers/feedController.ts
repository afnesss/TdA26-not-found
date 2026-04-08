import { Request, Response } from "express";
import { db } from "../db";
import { feedItems } from "../db/schema";
import { logger } from "../utils/logger";
import { eq, desc, and, lt } from "drizzle-orm";
import { sseManager } from "../utils/sseManager";
import { buildLocalizedField, getRequestLocale } from "../utils/i18n";
import { localizeMessage } from "../utils/localizedResponse";

export const getFeed = async (req: Request, res: Response) => {
  const { courseId, cursor } = req.params;
  const locale = getRequestLocale(req);
  const conditions = cursor
    ? and(
        eq(feedItems.courseId, courseId),
        lt(feedItems.createdAt, new Date(cursor)),
      )
    : eq(feedItems.courseId, courseId);
  try {
    const items = await db
      .select()
      .from(feedItems)
      .where(conditions)
      .orderBy(desc(feedItems.createdAt))
      .limit(15);

    res.json(items.map((item) => localizeMessage(item, locale)));
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch feed");
    res.status(500).json({ message: "Nepodařilo se načíst příspěvky" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { message, sourceLocale } = req.body;
  const locale = getRequestLocale(req);
  const nextSourceLocale =
    sourceLocale === "cs" || sourceLocale === "en" ? sourceLocale : locale;

  try {
    const [newItem] = await db
      .insert(feedItems)
      .values({
        courseId,
        sourceLocale: nextSourceLocale,
        type: "manual",
        message,
        messageI18n: buildLocalizedField(
          nextSourceLocale,
          message,
          req.body.messageI18n,
        ),
      })
      .returning();

    const localizedItem = localizeMessage(newItem, locale);
    sseManager.broadcast(courseId, "new_post", newItem, localizeMessage);

    res.status(201).json(localizedItem);
  } catch (error) {
    logger.error({ err: error }, "Failed to create post");
    res.status(500).json({ message: "Nepodařilo se vytvořit příspěvek" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { courseId, postId } = req.params;
  const { message, sourceLocale } = req.body;
  const locale = getRequestLocale(req);

  const [existingItem] = await db
    .select()
    .from(feedItems)
    .where(and(eq(feedItems.uuid, postId), eq(feedItems.courseId, courseId)));

  try {
    const [updatedItem] = await db
      .update(feedItems)
      .set({
        message,
        sourceLocale:
          sourceLocale === "cs" || sourceLocale === "en"
            ? sourceLocale
            : existingItem?.sourceLocale ?? locale,
        messageI18n: buildLocalizedField(
          sourceLocale === "cs" || sourceLocale === "en"
            ? sourceLocale
            : existingItem?.sourceLocale ?? locale,
          message,
          req.body.messageI18n ?? existingItem?.messageI18n,
        ),
        edited: true,
        updatedAt: new Date(),
      })
      .where(and(eq(feedItems.uuid, postId), eq(feedItems.courseId, courseId)))
      .returning();

    if (!updatedItem) {
      return res.status(404).json({ message: "Příspěvek nebyl nalezen" });
    }

    const localizedItem = localizeMessage(updatedItem, locale);
    sseManager.broadcast(courseId, "post_updated", updatedItem, localizeMessage);

    res.json(localizedItem);
  } catch (error) {
    logger.error({ err: error }, "Failed to update post");
    res.status(500).json({ message: "Nepodařilo se upravit příspěvek" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { courseId, postId } = req.params;

  try {
    const deleted = await db
      .delete(feedItems)
      .where(and(eq(feedItems.uuid, postId), eq(feedItems.courseId, courseId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Příspěvek nebyl nalezen" });
    }

    sseManager.broadcast(courseId, "post_deleted", { uuid: postId });

    res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, "Failed to delete post");
    res.status(500).json({ message: "Nepodařilo se smazat příspěvek" });
  }
};

export const streamFeed = (req: Request, res: Response) => {
  const { courseId } = req.params;
  const locale = getRequestLocale(req);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseManager.addClient(courseId, res, locale);
};
