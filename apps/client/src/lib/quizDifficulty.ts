import beginnerIcon from '@/assets/zarivka_beginner_modre.svg'
import easyIcon from '@/assets/zarivka_easy_modre.svg'
import mediumIcon from '@/assets/zarivka_medium_modre.svg'
import hardIcon from '@/assets/zarivka_hard_modra.svg'
import extremeIcon from '@/assets/zarivka_extreme_modre.svg'
import type { QuizDifficulty } from '@/lib/schemas'

type QuizDifficultyOption = {
  value: QuizDifficulty
  label: string
  icon: string
}

export const QUIZ_DIFFICULTY_OPTIONS: QuizDifficultyOption[] = [
  { value: 'beginner', label: 'Začátečník', icon: beginnerIcon },
  { value: 'easy', label: 'Lehký', icon: easyIcon },
  { value: 'medium', label: 'Střední', icon: mediumIcon },
  { value: 'hard', label: 'Těžký', icon: hardIcon },
  { value: 'extreme', label: 'Extrémní', icon: extremeIcon },
]

export const getQuizDifficultyOption = (
  difficulty?: QuizDifficulty | null,
): QuizDifficultyOption | undefined =>
  QUIZ_DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)
