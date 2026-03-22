import type { ApiError, QuizStateById } from '../../../lib/types'
import {
  QuizSubmitResponseSchema,
  type CourseSummary,
  type QuizAnswer,
} from '@/lib/schemas'
import type { FilterIds } from '@/lib/constants'
import { submitQuiz } from '@/api/queries/quizQueries'
import type { UseMutationResult, QueryClient } from '@tanstack/react-query'
import { useQuizSubmitMutation } from './quizSubmitMutation'
import { toast } from 'sonner'

export const handleSingleChoice = (
  quizId: string,
  questionId: string,
  index: number,
  setQuizState: React.Dispatch<React.SetStateAction<QuizStateById>>,
) => {
  setQuizState((prev) => ({
    ...prev,
    [quizId]: {
      ...prev[quizId],
      answers: {
        ...prev[quizId].answers,
        [questionId]: {
          uuid: questionId,
          selectedIndex: index,
        },
      },
    },
  }))
}

export const handleMultipleChoice = (
  quizId: string,
  questionId: string,
  index: number,
  setQuizState: React.Dispatch<React.SetStateAction<QuizStateById>>,
) => {
  setQuizState((prev) => {
    const current = prev[quizId]?.answers[questionId]?.selectedIndices ?? []

    const updated = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index]

    return {
      ...prev,
      [quizId]: {
        ...prev[quizId],
        answers: {
          ...prev[quizId].answers,
          [questionId]: {
            uuid: questionId,
            selectedIndices: updated,
          },
        },
      },
    }
  })
}

export const isQuizComplete = (
  quizId: string,
  totalQuestions: number,
  quizState: QuizStateById,
): boolean => {
  const quizStateEntry = quizState[quizId]

  if (!quizStateEntry) return false
  const answers = quizState[quizId].answers ?? {}
  const answersCount = Object.values(answers).filter(
    (i) =>
      i.selectedIndex !== undefined ||
      (Array.isArray(i.selectedIndices) && i.selectedIndices.length > 0),
  ).length

  return answersCount === totalQuestions
}

type SubmitQuizMutation = ReturnType<typeof useQuizSubmitMutation>

export const handleSubmitQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  quizState: QuizStateById,
  mutation: SubmitQuizMutation,
) => {
  const answers = Object.values(quizState[quizId].answers)

  mutation.mutate({
    courseId,
    moduleId,
    quizId,
    answers,
  })
}

export const filterCourses = (
  courses: CourseSummary[],
  searchQuery: string,
): CourseSummary[] => {
  return courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )
}

export const truncateDescription = (
  description?: string,
  length: number = 100,
): string => {
  if (!description) return ''
  if (description.length <= length) return description

  let truncated = description.slice(0, length)
  if (truncated.endsWith(',')) {
    truncated = truncated.slice(0, -1)
  }

  return `${truncated}...`
}

export const sortCoursesByFilter = (
  courses: CourseSummary[],
  selectedFilter: FilterIds,
): CourseSummary[] => {
  return [...courses].sort((a, b) => {
    if (selectedFilter === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    if (selectedFilter === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }

    if (selectedFilter === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }

    return 0
  })
}

export const onError = (error: ApiError, message: string) => {
  if (error?.isNetworkError) {
    toast.error(error.body?.message || 'Chyba připojení')
  } else {
    toast.error(message)
  }
}

export const onErrorWithRollback = (
  error: ApiError,
  message: string,
  queryClient: QueryClient,
  queryKey: unknown[],
  previousData: unknown,
) => {
  if (previousData !== undefined) {
    queryClient.setQueryData(queryKey, previousData)
  }
  onError(error, message)
}

export const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export const toDateTimeLocalValue = (value?: string | Date | null) => {
  if (!value) {
    return ''
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return formatDateTimeLocal(date)
}

export const formatDateWithToday = (
  dateString: string,
  showTime: boolean = false,
): string => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'Nezadáno'
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  const time = showTime
    ? ` • ${date.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : ''

  // if (dateOnly.getTime() === today.getTime()) {
  //   return `Dnes${time}`
  // }
  // if (dateOnly.getTime() === yesterday.getTime()) {
  //   return `Včera${time}`
  // }

  const formattedDate = date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${formattedDate}${time}`
}

export const fmt = (d: string) =>
  new Date(d).toLocaleString('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

export const handleSaveOnEnter = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  saveEdit?: () => void | Promise<void>,
) => {
  if (
    e.key !== 'Enter' ||
    e.shiftKey ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.nativeEvent.isComposing
  ) {
    return
  }
  e.preventDefault()
  e.currentTarget.blur()
  if (saveEdit) {
    void saveEdit()
  }
}
