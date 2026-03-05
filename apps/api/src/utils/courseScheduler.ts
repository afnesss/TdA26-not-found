import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { courses } from "../db/schema";
import { sseManager } from "./sseManager";
import { logger } from "./logger";

let intervalRef: NodeJS.Timeout | null = null;
let isRunning = false;
export const startIntervalScheduler = () => {
  if (intervalRef) return;
  intervalRef = setInterval(async () => {
    await runCheck();
  }, 10000);
};

const runCheck = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    const nowIso = new Date().toISOString();
    const newLiveCourse = await db
      .update(courses)
      .set({
        status: "live",
        startedAt: new Date(),
        scheduledFor: null,
        updatedAt: new Date(),
        status_history: sql`
      coalesce(${courses.status_history}, '[]'::jsonb) ||
      jsonb_build_array(
          jsonb_build_object(
            'status', 'live',
            'timestamp', ${nowIso}::text))
      `,
      })
      .where(
        and(
          eq(courses.status, "planned"),
          lte(courses.scheduledFor, new Date()),
        ),
      )
      .returning();

    if (newLiveCourse.length > 0) {
      for (const c of newLiveCourse) {
        sseManager.broadcast("courses", "course_upserted", c);
        sseManager.broadcast("courses", "course_auto_started", c);
        // Keep course-specific dashboards in sync.
        sseManager.broadcast(c.uuid, "course_updated", c);
      }
    }
  } catch (error) {
    logger.error({ err: error }, "[courseScheduler] Tick failed");
  } finally {
    isRunning = false;
  }
};

export const stopIntervalScheduler = () => {
  if (intervalRef) clearInterval(intervalRef);
  intervalRef = null;
};
