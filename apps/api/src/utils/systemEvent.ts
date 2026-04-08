import { db } from "../db";
import { feedItems } from "../db/schema";
import { buildLocalizedField } from "./i18n";
import { localizeMessage } from "./localizedResponse";
import { sseManager } from "./sseManager";

/**
 * Creates a system feed event and broadcasts it via SSE
 * @param courseId - The course UUID
 * @param messages - The event message translations
 */
export async function createSystemEvent(
  courseId: string,
  messages: { en: string; cs: string },
) {
  const sourceLocale = "en";
  const [feedItem] = await db
    .insert(feedItems)
    .values({
      courseId,
      sourceLocale,
      type: "system",
      message: messages.en,
      messageI18n: buildLocalizedField(sourceLocale, messages.en, {
        cs: messages.cs,
      }),
    })
    .returning();

  sseManager.broadcast(courseId, "new_post", feedItem, localizeMessage);

  return feedItem;
}
