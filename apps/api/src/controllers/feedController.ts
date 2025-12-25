import { Request, Response } from "express";
import { db } from "../db";
import { feedItems } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { sseManager } from "../utils/sseManager";

export const getFeed = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  try {
    const items = await db
      .select()
      .from(feedItems)
      .where(eq(feedItems.courseId, courseId))
      .orderBy(desc(feedItems.createdAt));

    res.json(items);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { message } = req.body;

  try {
    const [newItem] = await db
      .insert(feedItems)
      .values({
        courseId,
        type: "manual",
        message,
      })
      .returning();

    sseManager.broadcast(courseId, "new_post", newItem);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { courseId, postId } = req.params;
  const { message } = req.body;

  try {
    const [updatedItem] = await db
      .update(feedItems)
      .set({
        message,
        edited: true,
        updatedAt: new Date(),
      })
      .where(and(eq(feedItems.uuid, postId), eq(feedItems.courseId, courseId)))
      .returning();

    if (!updatedItem) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
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
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const streamFeed = (req: Request, res: Response) => {
  const { courseId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseManager.addClient(courseId, res);
};
