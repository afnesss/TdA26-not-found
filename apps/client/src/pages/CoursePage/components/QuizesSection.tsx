import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { type CourseDetail, type Quiz } from '@/lib/schemas'
import { useState, useEffect, startTransition, Fragment } from 'react'
import {
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Check,
  Play,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizStateById } from '../../../lib/types'
import {
  handleSingleChoice,
  handleMultipleChoice,
  handleSubmit,
  isQuizComplete,
} from '../utils/helperFunctions'
import { useCourseMutation } from '../utils/courseMutation'
import QuizComponent from '@/components/shared/QuizComponent'

type QuizesSectionProps = {
  courseData?: CourseDetail | null
}

const QuizesSection = ({ courseData }: QuizesSectionProps) => {
  const [quizState, setQuizState] = useState<QuizStateById>({})
  const queryMutation = useCourseMutation(setQuizState)

  useEffect(() => {
    if (!courseData?.quizzes) return

    const initialResults: QuizStateById = {}
    courseData?.quizzes.forEach((quiz) => {
      if (!quiz.uuid) return

      initialResults[quiz.uuid] = {
        status: 'idle',
        answers: {},
        showCorrect: false,
      }
    })
    if (Object.keys(initialResults).length === 0) return

    startTransition(() => {
      setQuizState((prev) => (Object.keys(prev).length ? prev : initialResults))
    })
  }, [courseData])

  return (
    <section>
      <Label size='xl' className='pl-3 md:pl-5'>
        Kvízy
      </Label>

      <div className='space-y-4'>
        {courseData?.quizzes?.map((quiz: Quiz) => (
          <QuizComponent
            key={quiz.uuid}
            quiz={quiz}
            mode='user'
            userState={quizState[quiz.uuid!]}
            onAnswerChange={(questionId, answer) => {
              setQuizState((prev) => ({
                ...prev,
                [quiz.uuid!]: {
                  ...prev[quiz.uuid!],
                  answers: {
                    ...prev[quiz.uuid!].answers,
                    [questionId]: { uuid: questionId, ...answer },
                  },
                },
              }))
            }}
            onSubmit={() =>
              handleSubmit(
                courseData.uuid,
                quiz.uuid!,
                quizState,
                queryMutation,
              )
            }
            onToggleShowCorrect={() => {
              setQuizState((prev) => ({
                ...prev,
                [quiz.uuid!]: {
                  ...prev[quiz.uuid!],
                  showCorrect: !(prev[quiz.uuid!].showCorrect ?? true),
                },
              }))
            }}
            isSubmitDisabled={
              !isQuizComplete(quiz.uuid!, quiz.questions.length, quizState) ||
              quizState[quiz.uuid!]?.status === 'submitted'
            }
            isSubmitting={
              queryMutation.variables?.quizId === quiz.uuid &&
              queryMutation.isPending
            }
          />
        ))}
      </div>
    </section>
  )
}

export default QuizesSection
