import type { QuizAnswer, QuizSubmitResponse } from '@/lib/schemas'

const STORAGE_PREFIX = 'quizSubmission:'

export type QuizSubmissionStorage = {
  submittedAt: string
  results: QuizSubmitResponse
  answers: QuizAnswer[]
}

const getStorageKey = (quizId: string, accountScope?: string) =>
  `${STORAGE_PREFIX}${accountScope ?? 'global'}:${quizId}`

export const getQuizSubmission = (
  quizId: string,
  accountScope?: string,
): QuizSubmissionStorage | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(
      getStorageKey(quizId, accountScope),
    )
    if (!raw) return null
    return JSON.parse(raw) as QuizSubmissionStorage
  } catch (error) {
    console.warn(`Error reading quiz submission for "${quizId}":`, error)
    return null
  }
}

export const setQuizSubmission = (
  quizId: string,
  results: QuizSubmitResponse,
  answers: QuizAnswer[],
  accountScope?: string,
) => {
  if (typeof window === 'undefined') return
  try {
    const payload: QuizSubmissionStorage = {
      submittedAt: new Date().toISOString(),
      results,
      answers,
    }
    window.localStorage.setItem(
      getStorageKey(quizId, accountScope),
      JSON.stringify(payload),
    )
  } catch (error) {
    console.warn(`Error saving quiz submission for "${quizId}":`, error)
  }
}

export const clearQuizSubmission = (quizId: string, accountScope?: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getStorageKey(quizId, accountScope))
  } catch (error) {
    console.warn(`Error clearing quiz submission for "${quizId}":`, error)
  }
}
