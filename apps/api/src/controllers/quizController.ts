import { Request, Response } from "express";
import { db } from "../db";
import { quizzes, quizSubmissions } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  Question,
  Quiz,
  QuizAnswer,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from "../schemas/quiz";
import { v4 as uuidv4 } from "uuid";
import { createSystemEvent } from "../utils/systemEvent";
import { sseManager } from "../utils/sseManager";
import { uuid } from "zod";

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;

    const result = await db
      .select({
        uuid: quizzes.uuid,
        title: quizzes.title,
        moduleId: quizzes.moduleId,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
          Number,
        ),
        averagePercentage: sql<number>`
          ROUND(
            AVG(
              CASE 
                WHEN ${quizSubmissions.maxScore} > 0 
                THEN CAST(${quizSubmissions.score} AS FLOAT) / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100
                ELSE NULL
              END
            )
          )
        `.mapWith(Number),
      })
      .from(quizzes)
      .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
      .where(eq(quizzes.moduleId, moduleId))
      .groupBy(quizzes.uuid)
      .orderBy(desc(quizzes.createdAt));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const quizData = req.body as Quiz;

    // Assign UUIDs to questions if missing
    const questionsWithIds = quizData.questions.map((q) => ({
      ...q,
      uuid: q.uuid || uuidv4(),
    }));

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        moduleId,
        title: quizData.title,
        questions: questionsWithIds,
      })
      .returning();

    // await createSystemEvent(courseId, `Přidán nový kvíz: ${quizData.title}`);

    const createdQuiz = {
      ...newQuiz,
      attemptsCount: 0,
      averagePercentage: null,
    };
    // sseManager.broadcast(courseId, "quiz_added", createdQuiz);

    // Return with attemptsCount 0 and no average yet
    res.status(201).json(createdQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId, quizId } = req.params;

    const [quiz] = await db
      .select({
        uuid: quizzes.uuid,
        title: quizzes.title,
        moduleId: quizzes.moduleId,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
          Number,
        ),
        averagePercentage: sql<number>`
          ROUND(AVG(CAST(${quizSubmissions.score} AS FLOAT) / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100))
        `.mapWith(Number),
      })
      .from(quizzes)
      .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.moduleId, moduleId)))
      .groupBy(quizzes.uuid);

    if (!quiz) {
      return res.status(404).json({ message: "Kvíz nebyl nalezen" });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId, quizId } = req.params;
    const quizData = req.body as Quiz;

    // Assign UUIDs to questions if missing (though they should persist on update)
    const questionsWithIds = quizData.questions.map((q) => ({
      ...q,
      uuid: q.uuid || uuidv4(),
    }));

    const [updatedQuiz] = await db
      .update(quizzes)
      .set({
        title: quizData.title,
        questions: questionsWithIds,
        updatedAt: new Date(),
      })
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.moduleId, moduleId)))
      .returning();

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Kvíz nebyl nalezen" });
    }

    // Get fresh attempts count and average
    const [stats] = await db
      .select({
        count: sql<number>`count(${quizSubmissions.uuid})`.mapWith(Number),
        averagePercentage: sql<number>`
          ROUND(AVG(CAST(${quizSubmissions.score} AS FLOAT) / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100))
        `.mapWith(Number),
      })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.quizId, quizId));

    // await createSystemEvent(
    //   courseId,
    //   `Kvíz aktualizován: ${updatedQuiz.title}`,
    // );

    const finalQuiz = {
      ...updatedQuiz,
      attemptsCount: stats.count,
      averagePercentage: stats.averagePercentage || null,
    };
    // sseManager.broadcast(courseId, "quiz_updated", finalQuiz);

    res.json(finalQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId, quizId } = req.params;

    // First check if quiz exists to get its title before deletion
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.moduleId, moduleId)));

    if (!existingQuiz) {
      return res.status(404).json({ message: "Kvíz nebyl nalezen" });
    }

    await db
      .delete(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.moduleId, moduleId)));

    // await createSystemEvent(courseId, `Kvíz odebrán: ${existingQuiz.title}`);

    // sseManager.broadcast(courseId, "quiz_deleted", { uuid: quizId });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId, quizId } = req.params;
    const { answers } = req.body as QuizSubmitRequest;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.moduleId, moduleId)));

    if (!quiz) {
      return res.status(404).json({ message: "Kvíz nebyl nalezen" });
    }

    const questions = quiz.questions as any[];
    let score = 0;
    const maxScore = questions.length; // Assuming 1 point per question
    const correctPerQuestion: boolean[] = [];

    // Map answers for easy lookup
    const answerMap = new Map<string, QuizAnswer>();
    answers.forEach((a) => answerMap.set(a.uuid, a));

    questions.forEach((q) => {
      const userAnswer = answerMap.get(q.uuid);
      let isCorrect = false;

      if (userAnswer) {
        if (q.type === "singleChoice") {
          if (userAnswer.selectedIndex === q.correctIndex) {
            isCorrect = true;
          }
        } else if (q.type === "multipleChoice") {
          // Compare arrays
          const correctIndices = (q.correctIndices as number[]).sort(
            (a, b) => a - b,
          );
          const selectedIndices = (userAnswer.selectedIndices || []).sort(
            (a, b) => a - b,
          );

          if (
            correctIndices.length === selectedIndices.length &&
            correctIndices.every((val, index) => val === selectedIndices[index])
          ) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) score++;
      correctPerQuestion.push(isCorrect);
    });

    // Save submission
    const [submission] = await db
      .insert(quizSubmissions)
      .values({
        quizId,
        score,
        maxScore,
        answers: answers,
      })
      .returning();

    // Get fresh attempts count and average
    const [stats] = await db
      .select({
        count: sql<number>`count(${quizSubmissions.uuid})`.mapWith(Number),
        averagePercentage: sql<number>`
          ROUND(AVG(CAST(${quizSubmissions.score} AS FLOAT) / CAST(${quizSubmissions.maxScore} AS FLOAT) * 100))
        `.mapWith(Number),
      })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.quizId, quizId));

    const updatedQuiz = {
      ...quiz,
      attemptsCount: stats.count,
      averagePercentage: stats.averagePercentage || null,
    };
    // sseManager.broadcast(courseId, "quiz_updated", updatedQuiz);

    const response: QuizSubmitResponse = {
      quizUuid: quizId,
      score,
      maxScore,
      correctPerQuestion,
      submittedAt: submission.createdAt.toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};

export const getQuizAnalytics = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.uuid, quizId));

    if (!quiz) {
      return res.status(404).json({ message: "Kvíz nebyl nalezen" });
    }
    const submissions = await db
      .select()
      .from(quizSubmissions)
      .where(eq(quizSubmissions.quizId, quizId))
      .orderBy(desc(quizSubmissions.createdAt));

    const totalAttempts = submissions.length;

    if (totalAttempts === 0) {
      return res.json({
        uuid: quiz.uuid,
        title: quiz.title,
        totalAttempts,
        avegarePercentage: 0,
        questionAnalytics: [],
      });
    }

    const totalScore = submissions.reduce((sum, s) => s.score + sum, 0);
    const averageScore = totalScore / totalAttempts;
    const questions = quiz.questions as Question[];
    const averagePercentage = (averageScore / questions.length) * 100;

    const questionAnalytics = questions.map((question, qIndex) => {
      const optionCounts = new Array(question.options.length).fill(0);
      let correctAnswersCount = 0;
      let isCorrect = false;

      submissions.forEach((submission) => {
        const answers = submission.answers as QuizAnswer[];
        const userAnswer = answers.find((a) => a.uuid === question.uuid);

        if (question.type === "singleChoice") {
          isCorrect = userAnswer?.selectedIndex === question.correctIndex;

          if (userAnswer?.selectedIndex !== undefined) {
            optionCounts[userAnswer.selectedIndex]++;
          }
        } else if (question.type === "multipleChoice") {
          const selectedIndices = (userAnswer?.selectedIndices || []).sort();
          const correctIndices = (question.correctIndices || []).sort();

          if (
            selectedIndices.length === correctIndices.length &&
            selectedIndices.every((s, i) => s === correctIndices[i])
          ) {
            isCorrect = true;
          }

          (userAnswer?.selectedIndices || []).forEach(
            (idx) => optionCounts[idx]++,
          );
        }

        if (isCorrect) correctAnswersCount++;
      });

      const optionStats = question.options.map((_, index: number) => {
        question.type === "singleChoice"
          ? (isCorrect = question.correctIndex === index)
          : (isCorrect = question.correctIndices.includes(index));

        return {
          index,
          selectedCount: optionCounts[index],
        };
      });

      return {
        uuid: question.uuid,
        correctAnswers: correctAnswersCount,
        correctRate: (correctAnswersCount / totalAttempts) * 100,
        options: optionStats,
      };
    });

    res.json({
      uuid: quiz.uuid,
      // attemptsCount: totalAttempts,
      averagePercentage: parseFloat(averagePercentage.toFixed(0)) || 0,
      questionAnalytics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};
