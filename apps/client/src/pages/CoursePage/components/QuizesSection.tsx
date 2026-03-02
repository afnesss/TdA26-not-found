import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import { Label } from '@/components/ui/label'
import { type CourseDetail, type Quiz } from '@/lib/schemas'
import { startTransition, useEffect, useState } from 'react'
import type { QuizStateById } from '../../../lib/types'
import { useQuizSubmitMutation } from '../utils/quizSubmitMutation'
import { handleSubmitQuiz, isQuizComplete } from '../utils/helperFunctions'
import quizImg from '@/assets/t-play-blue.svg'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { useParams } from 'react-router'
import {
  clearQuizSubmission,
  getQuizSubmission,
} from '../utils/quizSubmissionStorage'

type QuizesSectionProps = {
  quizzes?: Quiz[]
}

const QuizesSection = ({ quizzes }: QuizesSectionProps) => {
  const [quizState, setQuizState] = useState<QuizStateById>({})
  const queryMutation = useQuizSubmitMutation(setQuizState)
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null)
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()

  useEffect(() => {
    if (!quizzes) return

    const initialResults: QuizStateById = {}
    quizzes.forEach((quiz) => {
      if (!quiz.uuid) return

      const stored = getQuizSubmission(quiz.uuid)

      initialResults[quiz.uuid] = {
        status: stored ? 'submitted' : 'idle',
        answers: stored
          ? Object.fromEntries(
              stored.answers.map((answer) => [answer.uuid, answer]),
            )
          : {},
        showCorrect: false,
        results: stored?.results,
      }
    })
    if (Object.keys(initialResults).length === 0) return

    startTransition(() => {
      setQuizState((prev) => (Object.keys(prev).length ? prev : initialResults))
    })
  }, [quizzes])

  return (
    <section>
      <Label className='font-bold mb-2'>
        <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
          Kvízy
        </UnderlinedText>
      </Label>

      <div className='space-y-4'>
        {quizzes && quizzes.length > 0 ? (
          quizzes?.map((quiz: Quiz) => (
            <QuizComponent
              key={quiz.uuid}
              quiz={quiz}
              mode='user'
              userState={quizState[quiz.uuid!]}
              onAnswerChange={(questionId, answer) => {
                setQuizState((prev) => {
                  const currentQuizState = prev[quiz.uuid!] || {
                    status: 'idle',
                    answers: {},
                    showCorrect: false,
                  }

                  return {
                    ...prev,
                    [quiz.uuid!]: {
                      ...currentQuizState,
                      answers: {
                        ...currentQuizState.answers,
                        [questionId]: { uuid: questionId, ...answer },
                      },
                    },
                  }
                })
              }}
              onSubmit={() =>
                handleSubmitQuiz(
                  courseId!,
                  moduleId!,
                  quiz.uuid!,
                  quizState,
                  queryMutation,
                )
              }
              onReset={() => {
                clearQuizSubmission(quiz.uuid!)
                setQuizState((prev) => ({
                  ...prev,
                  [quiz.uuid!]: {
                    status: 'idle',
                    answers: {},
                    showCorrect: false,
                  },
                }))
              }}
              onToggleShowCorrect={() => {
                setQuizState((prev) => {
                  const currentQuizState = prev[quiz.uuid!] || {
                    status: 'idle',
                    answers: {},
                    showCorrect: false,
                  }

                  return {
                    ...prev,
                    [quiz.uuid!]: {
                      ...currentQuizState,
                      showCorrect: !currentQuizState.showCorrect,
                    },
                  }
                })
              }}
              isSubmitDisabled={
                !isQuizComplete(quiz.uuid!, quiz.questions.length, quizState) ||
                quizState[quiz.uuid!]?.status === 'submitted'
              }
              isSubmitting={
                queryMutation.variables?.quizId === quiz.uuid &&
                queryMutation.isPending
              }
              isExpanded={expandedQuizId === quiz.uuid}
              onToggleExpand={() => {
                setExpandedQuizId(
                  expandedQuizId === quiz.uuid ? null : (quiz.uuid ?? null),
                )
              }}
            />
          ))
        ) : (
          <StateComp
            img={quizImg}
            iconClassName='w-12 h-12 md:w-14 h-14'
            type='no-content'
            message='Zatím žádné kvízy'
            className='pt-8 pb-0'
          />
        )}
      </div>
    </section>
  )
}

export default QuizesSection
