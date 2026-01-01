import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { type CourseDetail } from '@/lib/schemas'
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

type QuizesSectionProps = {
  courseData?: CourseDetail | null
}

const QuizesSection = ({ courseData }: QuizesSectionProps) => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null)
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

  const toggleQuiz = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId)
  }

  return (
    <section>
      <Label size='xl' className='pl-3 md:pl-5'>
        Kvízy
      </Label>

      <div className='space-y-4'>
        {courseData?.quizzes?.map((quiz) => {
          const isExpanded = expandedQuiz === quiz.uuid

          return (
            <div
              key={quiz.uuid}
              className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'
            >
              <div
                className='p-5 cursor-pointer hover:bg-gray-50 transition-colors'
                onClick={() => quiz.uuid && toggleQuiz(quiz.uuid)}
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div className='flex-1'>
                      <Label className='mb-3' variant={'name'}>
                        {quiz.title}
                      </Label>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span className='flex items-center gap-1.5'>
                          <Clock size={16} className='text-primary' />
                          <span className='font-medium'>
                            {quiz.attemptsCount ?? 0} vyplnění
                          </span>
                        </span>
                        <span className='flex items-center gap-1.5'>
                          <CheckCircle size={16} className='text-secondary' />
                          <span className='font-medium'>
                            {quiz.questions?.length} otázek
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
                    {isExpanded ? (
                      <ChevronUp
                        size={24}
                        strokeWidth={3}
                        className='text-secondary'
                      />
                    ) : (
                      <ChevronDown
                        size={24}
                        strokeWidth={3}
                        className='text-secondary'
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className='px-5 pb-5 space-y-4 border-t border-gray-100 pt-5 bg-gray-50/50'>
                  {quiz.questions.map((question, qIndex) => (
                    <Fragment key={question.uuid ?? qIndex}>
                      <div className='flex items-center gap-3 mb-4 '>
                        <span className='font-bold text-background text-base bg-primary w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center shrink-0'>
                          {qIndex + 1}
                        </span>
                        <Label size={'md'}>{question.question}</Label>
                        {quizState[quiz.uuid!].status === 'submitted' &&
                          (quizState[quiz.uuid!].results?.correctPerQuestion[
                            qIndex
                          ] ? (
                            <Check
                              className='text-secondary'
                              size={22}
                              strokeWidth={3}
                            />
                          ) : (
                            <X
                              className='text-destructive'
                              size={22}
                              strokeWidth={3}
                            />
                          ))}
                      </div>

                      <div className='space-y-2.5  lg:pl-10'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                          {question.options.map((option, optIndex) => {
                            const answer =
                              quizState[quiz.uuid!].answers[question.uuid!]

                            const isSelected =
                              question.type === 'singleChoice'
                                ? answer?.selectedIndex === optIndex
                                : (answer?.selectedIndices ?? []).includes(
                                    optIndex,
                                  )
                            const isSubmitted =
                              quizState[quiz.uuid!].status === 'submitted'
                            const showCorrect =
                              quizState[quiz.uuid!].showCorrect
                            const isCorrectOption =
                              isSubmitted &&
                              (question.type === 'singleChoice'
                                ? question.correctIndex === optIndex
                                : (
                                    question.correctIndices as number[]
                                  ).includes(optIndex))
                            return (
                              <Label
                                key={optIndex}
                                className={cn(
                                  'flex items-center gap-3 p-2.5 md:p-3.5 rounded-lg transition-all border border-gray-200 bg-gray-100',
                                  !isSubmitted &&
                                    'cursor-pointer hover:bg-primary/20 hover:border-gray-300',

                                  isSelected &&
                                    !showCorrect &&
                                    !isSubmitted &&
                                    'bg-primary/10',
                                  isSelected &&
                                    isSubmitted &&
                                    !showCorrect &&
                                    'bg-gray-200',

                                  isSelected &&
                                    isCorrectOption &&
                                    showCorrect &&
                                    'bg-secondary/40',
                                  isSelected &&
                                    !isCorrectOption &&
                                    isSubmitted &&
                                    showCorrect &&
                                    'bg-destructive/30',
                                  !isSelected &&
                                    isCorrectOption &&
                                    showCorrect &&
                                    'border-secondary border-2',
                                )}
                              >
                                <input
                                  type={
                                    question.type === 'singleChoice'
                                      ? 'radio'
                                      : 'checkbox'
                                  }
                                  name={question.uuid}
                                  checked={isSelected}
                                  disabled={isSubmitted}
                                  className='shrink-0 w-4 h-4 md:w-5 md:h-5 text-primary accent-primary'
                                  onChange={() => {
                                    if (question.uuid) {
                                      if (question.type === 'singleChoice') {
                                        handleSingleChoice(
                                          quiz.uuid!,
                                          question.uuid,
                                          optIndex,
                                          setQuizState,
                                        )
                                      } else {
                                        handleMultipleChoice(
                                          quiz.uuid!,
                                          question.uuid,
                                          optIndex,
                                          setQuizState,
                                        )
                                      }
                                    }
                                  }}
                                />

                                <span className='text-sm font-medium text-foreground'>
                                  {option}
                                </span>
                              </Label>
                            )
                          })}
                        </div>
                      </div>
                      <hr className='border-b border mt-6 mb-4 border-gray-100'></hr>
                    </Fragment>
                  ))}
                  <div className='flex flex-col lg:mx-10'>
                    {queryMutation.isError && (
                      <Label size={'md'} variant={'error'} className='mb-3'>
                        {queryMutation.error.message as string}
                      </Label>
                    )}
                    <div className='flex flex-row items-center justify-between'>
                      <div className='flex items-center gap-3 md:gap-10  flex-col md:flex-row'>
                        <Button
                          variant='primary'
                          size='primary'
                          className='w-fit'
                          disabled={
                            (queryMutation.variables?.quizId === quiz.uuid &&
                              queryMutation.isPending) ||
                            quizState[quiz.uuid!]?.status === 'submitted' ||
                            !isQuizComplete(
                              quiz.uuid!,
                              quiz.questions.length,
                              quizState,
                            )
                          }
                          onClick={() => {
                            handleSubmit(
                              courseData.uuid,
                              quiz.uuid!,
                              quizState,
                              queryMutation,
                            )
                          }}
                        >
                          <Play size={20} />
                          Odeslat odpovědi
                        </Button>

                        <Button
                          variant='link'
                          className='rounded-lg shadow-none'
                          disabled={
                            quizState[quiz.uuid!]?.status !== 'submitted'
                          }
                          onClick={() => {
                            setQuizState((prev) => ({
                              ...prev,
                              [quiz.uuid!]: {
                                ...prev[quiz.uuid!],
                                showCorrect: !(
                                  prev[quiz.uuid!].showCorrect ?? true
                                ),
                              },
                            }))
                          }}
                        >
                          {quizState[quiz.uuid!].showCorrect
                            ? 'Skrýt odpovědi'
                            : 'Zobrazit odpovědi'}
                        </Button>
                      </div>

                      {quizState[quiz.uuid!]?.status === 'submitted' && (
                        <Label
                          className='text-primary flex items-center gap-3'
                          size={'lg'}
                        >
                          <CheckCircle size={20} />
                          {quizState[quiz.uuid!].results?.score} /{' '}
                          {quizState[quiz.uuid!].results?.maxScore}
                        </Label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default QuizesSection
