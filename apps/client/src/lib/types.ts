import type { QuizAnswer, QuizSubmitResponse } from '@/lib/schemas'

export type QuizState = {
  answers: Record<string, QuizAnswer>
  status: 'idle' | 'submitting' | 'submitted' | 'error'
  results?: QuizSubmitResponse
  error?: string
  showCorrect?: boolean
}
export type QuizStateById = Record<string, QuizState>

export type ApiError = Error & {
  status?: number
  statusText?: string
  body?: {
    message?: string
    error?: string
    details?: string
  }
  isNetworkError?: boolean
}
