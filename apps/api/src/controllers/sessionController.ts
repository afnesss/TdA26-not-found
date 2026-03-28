import { eq, sql } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db";
import { modules, quizzes, quizSubmissions, users } from "../db/schema";
import { logger } from "../utils/logger";

type SubmissionRow = {
  userId: string;
  username: string;
  xp: number;
  level: number;
  quizId: string;
  score: number;
  maxScore: number;
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

const getTotalQuizzes = async (courseId: string) => {
  const [quizStats] = await db
    .select({
      totalQuizzes: sql<number>`count(${quizzes.uuid})`.mapWith(Number),
    })
    .from(quizzes)
    .innerJoin(modules, eq(quizzes.moduleId, modules.uuid))
    .where(eq(modules.courseId, courseId));

  return quizStats?.totalQuizzes ?? 0;
};

const getCourseSubmissionRows = async (courseId: string): Promise<SubmissionRow[]> => {
  return db
    .select({
      userId: users.uuid,
      username: users.username,
      xp: users.xp,
      level: users.level,
      quizId: quizzes.uuid,
      score: quizSubmissions.score,
      maxScore: quizSubmissions.maxScore,
      submittedAt: quizSubmissions.createdAt,
    })
    .from(quizSubmissions)
    .innerJoin(users, eq(quizSubmissions.userId, users.uuid))
    .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.uuid))
    .innerJoin(modules, eq(quizzes.moduleId, modules.uuid))
    .where(eq(modules.courseId, courseId));
};

const buildLeaderboard = (
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
      latestByQuiz: Map<string, SubmissionRow>;
    }
  >();

  for (const row of rows) {
    const existing = userStats.get(row.userId);
    if (!existing) {
      userStats.set(row.userId, {
        userId: row.userId,
        username: row.username,
        xp: row.xp,
        level: row.level,
        submissionsCount: 1,
        latestByQuiz: new Map([[row.quizId, row]]),
      });
      continue;
    }

    existing.submissionsCount += 1;
    const latestForQuiz = existing.latestByQuiz.get(row.quizId);
    if (
      !latestForQuiz ||
      new Date(row.submittedAt).getTime() > new Date(latestForQuiz.submittedAt).getTime()
    ) {
      existing.latestByQuiz.set(row.quizId, row);
    }
  }

  const ranked = Array.from(userStats.values())
    .map((user) => {
      const latestSubmissions = Array.from(user.latestByQuiz.values());
      const completedQuizzes = latestSubmissions.length;
      const successRate =
        completedQuizzes > 0
          ? Math.round(
              latestSubmissions.reduce((sum, item) => {
                if (!item.maxScore || item.maxScore <= 0) {
                  return sum;
                }
                return sum + (item.score / item.maxScore) * 100;
              }, 0) / completedQuizzes,
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

export async function getCourseSessionOverview(req: Request, res: Response) {
  const { uuid: courseId } = req.params;

  try {
    const totalQuizzes = await getTotalQuizzes(courseId);
    const rows = await getCourseSubmissionRows(courseId);
    const leaderboard = buildLeaderboard(rows, totalQuizzes);

    return res.json({
      courseId,
      totalQuizzes,
      leaderboard,
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
    const rows = await getCourseSubmissionRows(courseId);
    const leaderboard = buildLeaderboard(rows, totalQuizzes).map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      username: entry.username,
      successRate: entry.successRate,
      xp: entry.xp,
      level: entry.level,
      completedQuizzes: entry.completedQuizzes,
      totalQuizzes: entry.totalQuizzes,
      submissionsCount: entry.submissionsCount,
      status: entry.status,
      progressPercent: entry.progressPercent,
    }));

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
