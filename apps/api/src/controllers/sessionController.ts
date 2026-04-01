import { and, eq, sql } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db";
import { courses, modules, quizzes, quizSubmissions, users } from "../db/schema";
import type { AuthRequest } from "../types/auth";
import { logger } from "../utils/logger";

type QuizDifficulty = "beginner" | "easy" | "medium" | "hard" | "extreme";

type CourseStudentRow = {
  userId: string;
  username: string;
  xp: number;
  level: number;
};

type SubmissionRow = {
  userId: string;
  username: string;
  xp: number;
  level: number;
  quizId: string;
  score: number;
  maxScore: number;
  difficulty: QuizDifficulty;
  submittedAt: Date;
};

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  xp: number;
  level: number;
  successRate: number | null;
  submissionsCount: number;
  completedQuizzes: number;
  totalQuizzes: number;
  progressPercent: number;
  status: "completed" | "in_progress";
};

const RETRY_PENALTY_PERCENT = 5;
const QUIZ_DIFFICULTY_WEIGHT: Record<QuizDifficulty, number> = {
  beginner: 1,
  easy: 2,
  medium: 4,
  hard: 6,
  extreme: 8,
};

const resolveQuizDifficulty = (value: unknown): QuizDifficulty => {
  if (
    value === "beginner" ||
    value === "easy" ||
    value === "medium" ||
    value === "hard" ||
    value === "extreme"
  ) {
    return value;
  }

  return "beginner";
};

const getTotalQuizzes = async (courseId: string) => {
  const [quizStats] = await db
    .select({
      totalQuizzes: sql<number>`count(${quizzes.uuid})`.mapWith(Number),
    })
    .from(quizzes)
    .innerJoin(modules, eq(quizzes.moduleId, modules.uuid))
    .where(and(eq(modules.courseId, courseId), eq(modules.status, "active")));

  return quizStats?.totalQuizzes ?? 0;
};

const getCourseSubmissionRows = async (courseId: string): Promise<SubmissionRow[]> => {
  const rows = await db
    .select({
      userId: users.uuid,
      username: users.username,
      xp: users.xp,
      level: users.level,
      quizId: quizzes.uuid,
      score: quizSubmissions.score,
      maxScore: quizSubmissions.maxScore,
      difficulty: quizzes.difficulty,
      submittedAt: quizSubmissions.createdAt,
    })
    .from(quizSubmissions)
    .innerJoin(users, eq(quizSubmissions.userId, users.uuid))
    .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.uuid))
    .innerJoin(modules, eq(quizzes.moduleId, modules.uuid))
    .innerJoin(courses, eq(modules.courseId, courses.uuid))
    .where(
      and(
        eq(modules.courseId, courseId),
        eq(modules.status, "active"),
        eq(users.organizationId, courses.organizationId),
        eq(users.role, "student"),
      ),
    );

  return rows.map((row) => ({
    ...row,
    difficulty: resolveQuizDifficulty(row.difficulty),
  }));
};

const getCourseStudents = async (courseId: string): Promise<CourseStudentRow[]> => {
  return db
    .select({
      userId: users.uuid,
      username: users.username,
      xp: users.xp,
      level: users.level,
    })
    .from(users)
    .innerJoin(courses, eq(users.organizationId, courses.organizationId))
    .where(and(eq(courses.uuid, courseId), eq(users.role, "student")));
};

const buildLeaderboard = (
  students: CourseStudentRow[],
  rows: SubmissionRow[],
  totalQuizzes: number,
): LeaderboardEntry[] => {
  const userStats = new Map<
    string,
    {
      userId: string;
      username: string;
      xp: number;
      level: number;
      submissionsCount: number;
      quizStats: Map<
        string,
        {
          attempts: number;
          bestPercent: number;
          difficulty: QuizDifficulty;
        }
      >;
    }
  >();

  for (const student of students) {
    userStats.set(student.userId, {
      userId: student.userId,
      username: student.username,
      xp: student.xp,
      level: student.level,
      submissionsCount: 0,
      quizStats: new Map(),
    });
  }

  for (const row of rows) {
    const existing = userStats.get(row.userId);
    if (!existing) {
      userStats.set(row.userId, {
        userId: row.userId,
        username: row.username,
        xp: row.xp,
        level: row.level,
        submissionsCount: 1,
        quizStats: new Map([
          [
            row.quizId,
            {
              attempts: 1,
              bestPercent:
                row.maxScore > 0 ? (row.score / row.maxScore) * 100 : 0,
              difficulty: row.difficulty,
            },
          ],
        ]),
      });
      continue;
    }

    existing.submissionsCount += 1;
    const currentPercent = row.maxScore > 0 ? (row.score / row.maxScore) * 100 : 0;
    const existingQuizStats = existing.quizStats.get(row.quizId);

    if (!existingQuizStats) {
      existing.quizStats.set(row.quizId, {
        attempts: 1,
        bestPercent: currentPercent,
        difficulty: row.difficulty,
      });
      continue;
    }

    existingQuizStats.attempts += 1;
    existingQuizStats.bestPercent = Math.max(
      existingQuizStats.bestPercent,
      currentPercent,
    );
  }

  const ranked = Array.from(userStats.values())
    .map((user) => {
      const quizStats = Array.from(user.quizStats.values());
      const completedQuizzes = quizStats.length;
      const successRate =
        completedQuizzes > 0
          ? Math.round(
              quizStats.reduce(
                (accumulator, quiz) => {
                  const penalizedScore = Math.max(
                    0,
                    quiz.bestPercent -
                      Math.max(0, quiz.attempts - 1) * RETRY_PENALTY_PERCENT,
                  );
                  const weight = QUIZ_DIFFICULTY_WEIGHT[quiz.difficulty] ?? 1;

                  return {
                    weightedScoreSum:
                      accumulator.weightedScoreSum + penalizedScore * weight,
                    weightSum: accumulator.weightSum + weight,
                  };
                },
                { weightedScoreSum: 0, weightSum: 0 },
              ).weightedScoreSum /
                Math.max(
                  1,
                  quizStats.reduce(
                    (sum, quiz) =>
                      sum + (QUIZ_DIFFICULTY_WEIGHT[quiz.difficulty] ?? 1),
                    0,
                  ),
                ),
            )
          : null;

      const progressPercent =
        totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

      const status: "completed" | "in_progress" =
        totalQuizzes > 0 && completedQuizzes >= totalQuizzes
          ? "completed"
          : "in_progress";

      return {
        userId: user.userId,
        username: user.username,
        xp: user.xp,
        level: user.level,
        successRate,
        submissionsCount: user.submissionsCount,
        completedQuizzes,
        totalQuizzes,
        progressPercent,
        status,
      };
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "completed" ? -1 : 1;
      }

      if (a.completedQuizzes === 0 && b.completedQuizzes > 0) {
        return 1;
      }

      if (b.completedQuizzes === 0 && a.completedQuizzes > 0) {
        return -1;
      }

      if (a.submissionsCount !== b.submissionsCount) {
        return a.submissionsCount - b.submissionsCount;
      }

      const scoreA = a.successRate ?? -1;
      const scoreB = b.successRate ?? -1;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      if (a.completedQuizzes !== b.completedQuizzes) {
        return b.completedQuizzes - a.completedQuizzes;
      }

      return a.username.localeCompare(b.username, "cs");
    })
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

  return ranked;
};

export async function getCourseSessionOverview(req: AuthRequest, res: Response) {
  const { uuid: courseId } = req.params;

  try {
    const totalQuizzes = await getTotalQuizzes(courseId);
    const students = await getCourseStudents(courseId);
    const rows = await getCourseSubmissionRows(courseId);
    const leaderboard = buildLeaderboard(students, rows, totalQuizzes);
    const visibleLeaderboard =
      req.user?.actorType === "organization_user" && req.user.role === "student"
        ? leaderboard.filter((entry) => entry.completedQuizzes > 0)
        : leaderboard;

    return res.json({
      courseId,
      totalQuizzes,
      leaderboard: visibleLeaderboard,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch course leaderboard overview");
    return res.status(500).json({ message: "Nepodařilo se načíst leaderboard" });
  }
}

export async function getCourseSessionLeaderboard(req: Request, res: Response) {
  const { uuid: courseId } = req.params;

  try {
    const totalQuizzes = await getTotalQuizzes(courseId);
    const students = await getCourseStudents(courseId);
    const rows = await getCourseSubmissionRows(courseId);
    const leaderboard = buildLeaderboard(students, rows, totalQuizzes).filter(
      (entry) => entry.completedQuizzes > 0,
    );

    return res.json({
      courseId,
      totalQuizzes,
      leaderboard,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch course leaderboard");
    return res.status(500).json({ message: "Nepodařilo se načíst leaderboard" });
  }
}
