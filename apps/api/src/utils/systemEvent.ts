import { db } from "../db";
import { feedItems } from "../db/schema";
import { buildLocalizedField } from "./i18n";
import { localizeMessage } from "./localizedResponse";
import { sseManager } from "./sseManager";

/**
 * Creates a system feed event and broadcasts it via SSE
 * @param courseId - The course UUID
 * @param message - The event message
 */
export async function createSystemEvent(courseId: string, message: string) {
  const sourceLocale = "en";
  const [feedItem] = await db
    .insert(feedItems)
    .values({
      courseId,
      sourceLocale,
      type: "system",
      message,
      messageI18n: buildLocalizedField(sourceLocale, message),
    })
    .returning();

  sseManager.broadcast(courseId, "new_post", localizeMessage(feedItem, "en"));

  return feedItem;
}
