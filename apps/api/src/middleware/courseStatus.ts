import { Request, Response, NextFunction, RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { courses } from "../db/schema";

type CourseStatus = typeof courses.$inferSelect.status;

type CourseStatusOptions = {
  param?: string;
  allowStatuses?: CourseStatus[];
  message?: string;
  predicate?: (status: CourseStatus, req: Request) => boolean;
};

const DEFAULT_FORBIDDEN_MESSAGE =
  "Změna není povolena v aktuálním stavu kurzu";

const fetchCourseStatus = async (courseId: string) => {
  const [course] = await db
    .select({ status: courses.status })
    .from(courses)
    .where(eq(courses.uuid, courseId));

  return course?.status ?? null;
};

const requireCourseStatus = ({
  param = "courseId",
  allowStatuses,
  message,
  predicate,
}: CourseStatusOptions): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params[param];
      if (!courseId) {
        return res.status(400).json({ message: "Chybí identifikátor kurzu" });
      }

      const status = await fetchCourseStatus(courseId);
      if (!status) {
        return res.status(404).json({ message: "Kurz nebyl nalezen" });
      }

      const allowed =
        predicate?.(status, req) ??
        (allowStatuses ? allowStatuses.includes(status) : true);

      if (!allowed) {
        return res
          .status(403)
          .json({ message: message ?? DEFAULT_FORBIDDEN_MESSAGE });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Došlo k chybě serveru" });
    }
  };
};

export const requireCourseDraft = (param?: string) =>
  requireCourseStatus({
    param,
    allowStatuses: ["draft"],
    message: "Kurz lze upravovat pouze ve stavu návrh",
  });

export const requireCourseLiveOrDraft = (param?: string) =>
  requireCourseStatus({
    param,
    allowStatuses: ["draft", "live"],
    message: "Změna je povolena pouze ve stavu návrh nebo živě",
  });

export const requireCourseNotArchived = (param?: string) =>
  requireCourseStatus({
    param,
    predicate: (status) => status !== "archived",
    message: "Archivovaný kurz nelze upravovat",
  });

export const requireCourseUpdateAllowed = (param?: string) =>
  requireCourseStatus({
    param,
    predicate: (status, req) => {
      const hasName = req.body?.name !== undefined;
      const hasDescription = req.body?.description !== undefined;
      const hasStatus = req.body?.status !== undefined;
      const hasScheduledFor = req.body?.scheduledFor !== undefined;
      const isStatusChanged = hasStatus && req.body?.status !== status;

      const isStatusOnlyChange =
        hasStatus && !hasName && !hasDescription && !hasScheduledFor;

      if (isStatusOnlyChange) {
        // Status change is always allowed regardless of current course status.
        return true;
      }

      const isScheduleOnlyChange =
        hasScheduledFor && !hasName && !hasDescription && !hasStatus;

      if (isScheduleOnlyChange) {
        // Rescheduling is allowed for editable pre-launch states.
        return status === "draft" || status === "planned";
      }

      const isStatusAndScheduleChange =
        hasStatus && hasScheduledFor && !hasName && !hasDescription;

      if (isStatusAndScheduleChange) {
        // Allow state transitions with schedule updates.
        // Controller-level validation enforces transition/date rules.
        return isStatusChanged || status === "draft" || status === "planned";
      }

      // Any other course data changes are only allowed in draft.
      return status === "draft";
    },
    message: "Změna kurzu není povolena v aktuálním stavu kurzu",
  });

export const requireModuleUpdateAllowed = (param?: string) =>
  requireCourseStatus({
    param,
    predicate: (status, req) => {
      if (status === "archived") {
        return false;
      }

      const hasName = req.body?.name !== undefined;
      const hasDescription = req.body?.description !== undefined;
      const hasStatus = req.body?.status !== undefined;

      const isStatusOnlyChange = hasStatus && !hasName && !hasDescription;

      if (isStatusOnlyChange) {
        return status === "draft" || status === "live";
      }

      // Any other module detail changes are only allowed in draft.
      return status === "draft";
    },
    message: "Změna modulu není povolena v aktuálním stavu kurzu",
  });
