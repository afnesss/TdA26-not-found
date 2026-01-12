import { db } from "../db";
import { feedItems } from "../db/schema";
import { sseManager } from "./sseManager";

/**
 * Creates a system feed event and broadcasts it via SSE
 * @param courseId - The course UUID
 * @param message - The event message
 */
export async function createSystemEvent(courseId: string, message: string) {
  const [feedItem] = await db
    .insert(feedItems)
    .values({
      courseId,
      type: "system",
      message,
    })
    .returning();

  sseManager.broadcast(courseId, "new_post", feedItem);

  return feedItem;
}
