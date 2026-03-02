import type { QuizAnswer, QuizSubmitResponse } from '@/lib/schemas'

const STORAGE_PREFIX = 'quizSubmission:'

export type QuizSubmissionStorage = {
  submittedAt: string
  results: QuizSubmitResponse
  answers: QuizAnswer[]
}

const getStorageKey = (quizId: string) => `${STORAGE_PREFIX}${quizId}`

export const getQuizSubmission = (
  quizId: string,
): QuizSubmissionStorage | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getStorageKey(quizId))
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
) => {
  if (typeof window === 'undefined') return
  try {
    const payload: QuizSubmissionStorage = {
      submittedAt: new Date().toISOString(),
      results,
      answers,
    }
    window.localStorage.setItem(getStorageKey(quizId), JSON.stringify(payload))
  } catch (error) {
    console.warn(`Error saving quiz submission for "${quizId}":`, error)
  }
}

export const clearQuizSubmission = (quizId: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getStorageKey(quizId))
  } catch (error) {
    console.warn(`Error clearing quiz submission for "${quizId}":`, error)
  }
}
