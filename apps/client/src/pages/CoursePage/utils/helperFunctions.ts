import type { QuizStateById } from "./types";
import {QuizSubmitResponseSchema,  type QuizAnswer} from "@/lib/schemas";
import { submitQuiz } from "@/api/queries";
import type { UseMutationResult } from "@tanstack/react-query";

export const handleSingleChoice = (
  quizId: string, 
  questionId: string, 
  index: number, 
  setQuizState: React.Dispatch<React.SetStateAction<QuizStateById>>) => {

  setQuizState(prev => ({
    ...prev,
    [quizId]:{
      ...prev[quizId],
      answers:{
        ...prev[quizId].answers,
        [questionId]: {
          uuid: questionId,
          selectedIndex: index
        } 
      }
    }
      
  }))
}

export const handleMultipleChoice = (
  quizId: string, 
  questionId: string, 
  index: number, 
  setQuizState: React.Dispatch<React.SetStateAction<QuizStateById>>) => {

  setQuizState(prev => {
    const current = prev[quizId]?.answers[questionId]?.selectedIndices ?? [];

    const updated = current.includes(index)
      ? current.filter(i => i !== index)
      : [...current, index];

    return {
    ...prev,
    [quizId]:{
      ...prev[quizId],
      answers:{
        ...prev[quizId].answers, 
        [questionId]: {
          uuid: questionId,
          selectedIndices: updated
        } 
      }
    }
    };
  });
}

export const fetchCourse = async ({ courseId, quizId, answers, setQuizState }: 
  {courseId: string; 
  quizId: string; 
  answers: QuizAnswer[],
  setQuizState: React.Dispatch<React.SetStateAction<QuizStateById>>}) => {

      const raw = await submitQuiz(courseId, quizId , {answers});

      const parsed = QuizSubmitResponseSchema.safeParse(raw);

      if (!parsed.success){
          console.error("quizResponseSubmit schema validation failed", parsed.error);
          throw new Error("Invalid data to submit");
      }

      setQuizState (prev => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        status: 'submitted',
        results: parsed.data,
        showCorrect: false
      }
    }))
      return parsed.data;
  }

export const isQuizComplete = (quizId: string, totalQuestions: number, quizState: QuizStateById): boolean =>{
  const answers = quizState[quizId].answers ?? {};

  const answersCount = Object.values(answers).filter(i => i.selectedIndex !== undefined ||
    Array.isArray(i.selectedIndices) && i.selectedIndices.length > 0
  ).length;

  return answersCount === totalQuestions;
}

export const handleSubmit = async (courseId: string, quizId: string, quizState: QuizStateById, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, { courseId: string; quizId: string; answers: QuizAnswer[] }, any>) => {

  const answers = Object.values(quizState[quizId].answers);

  mutation.mutate({
    courseId: courseId, 
    quizId, 
    answers,})
}