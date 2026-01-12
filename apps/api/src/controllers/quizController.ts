import { Request, Response } from "express";
import { db } from "../db";
import { quizzes, quizSubmissions } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  Quiz,
  QuizAnswer,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from "../schemas/quiz";
import { v4 as uuidv4 } from "uuid";
import { createSystemEvent } from "../utils/systemEvent";

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await db
      .select({
        uuid: quizzes.uuid,
        title: quizzes.title,
        courseId: quizzes.courseId,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
          Number
        ),
      })
      .from(quizzes)
      .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
      .where(eq(quizzes.courseId, courseId))
      .groupBy(quizzes.uuid)
      .orderBy(desc(quizzes.createdAt));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const quizData = req.body as Quiz;

    // Assign UUIDs to questions if missing
    const questionsWithIds = quizData.questions.map((q) => ({
      ...q,
      uuid: q.uuid || uuidv4(),
    }));

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        courseId,
        title: quizData.title,
        questions: questionsWithIds,
      })
      .returning();

    await createSystemEvent(courseId, `New quiz added: ${quizData.title}`);

    // Return with attemptsCount 0
    res.status(201).json({ ...newQuiz, attemptsCount: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId, quizId } = req.params;

    const [quiz] = await db
      .select({
        uuid: quizzes.uuid,
        title: quizzes.title,
        courseId: quizzes.courseId,
        questions: quizzes.questions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        attemptsCount: sql<number>`count(${quizSubmissions.uuid})`.mapWith(
          Number
        ),
      })
      .from(quizzes)
      .leftJoin(quizSubmissions, eq(quizzes.uuid, quizSubmissions.quizId))
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.courseId, courseId)))
      .groupBy(quizzes.uuid);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId, quizId } = req.params;
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
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.courseId, courseId)))
      .returning();

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Get fresh attempts count
    const [stats] = await db
      .select({
        count: sql<number>`count(${quizSubmissions.uuid})`.mapWith(Number),
      })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.quizId, quizId));

    await createSystemEvent(courseId, `Quiz updated: ${updatedQuiz.title}`);

    res.json({ ...updatedQuiz, attemptsCount: stats.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId, quizId } = req.params;

    // First check if quiz exists to get its title before deletion
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.courseId, courseId)));

    if (!existingQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await db
      .delete(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.courseId, courseId)));

    await createSystemEvent(courseId, `Quiz removed: ${existingQuiz.title}`);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { courseId, quizId } = req.params;
    const { answers } = req.body as QuizSubmitRequest;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.uuid, quizId), eq(quizzes.courseId, courseId)));

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
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
            (a, b) => a - b
          );
          const selectedIndices = (userAnswer.selectedIndices || []).sort(
            (a, b) => a - b
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
    res.status(500).json({ message: "Internal server error" });
  }
};
