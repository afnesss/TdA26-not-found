import { getQuizAnalytics } from '@/api/queries/quizQueries'
import DeleteConfirmDialog from '@/components/ui/AlertDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCapitalizedInput } from '@/lib/capitalize'
import {
  QUIZ_DIFFICULTY_OPTIONS,
  getQuizDifficultyOption,
} from '@/lib/quizDifficulty'
import {
  QuizValidationSchema,
  type Question,
  type Quiz,
  type QuizDifficulty,
  type QuizAnalyticsResponse,
} from '@/lib/schemas'
import type { QuizState } from '@/lib/types'
import { cn } from '@/lib/utils'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { handleSaveOnEnter } from '@/pages/CoursePage/utils/helperFunctions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  X,
} from 'lucide-react'
import { Fragment, useState } from 'react'
import { type Resolver, useForm, useWatch } from 'react-hook-form'
import { useParams } from 'react-router'
import { Textarea } from '../../ui/textarea'
import QuizQuestion from './QuizQuestion'
import QuizPageSwitcher from './QuizPageSwitcher'

const isDirtyText = (className?: string) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-center leading-none text-[10px] sm:text-xs font-medium text-primary px-1.5 py-0.5 sm:px-2 sm:py-1 \
        bg-primary/10 rounded-full whitespace-nowrap',
        className,
      )}
    >
      Neuloženo
    </span>
  )
}

const formatQuestionsCount = (count: number) => {
  const absCount = Math.abs(count)
  if (absCount === 1) return `${count} otázka`
  if (absCount >= 2 && absCount <= 4) return `${count} otázky`
  return `${count} otázek`
}

type QuestionType = 'singleChoice' | 'multipleChoice'
type QuizFormValues = Omit<Quiz, 'difficulty'> & {
  difficulty?: QuizDifficulty
}

const toQuizFormValues = (quiz: Quiz): QuizFormValues => ({
  ...quiz,
  difficulty: quiz.difficulty ?? undefined,
})

type QuizComponentProps = {
  quiz: Quiz
  mode: 'user' | 'lecturer' | 'lecturer-preview'

  // User mode props
  userState?: QuizState
  onAnswerChange?: (
    questionId: string,
    answer: { selectedIndex?: number; selectedIndices?: number[] },
  ) => void
  onSubmit?: () => void
  onToggleShowCorrect?: () => void
  onReset?: () => void
  isSubmitting?: boolean
  isSubmitDisabled?: boolean

  // Lecturer mode props
  onSave?: (quiz: Quiz) => void | Promise<void>
  onDelete?: () => void | Promise<void>
  isDraft?: boolean
  onCancelDraft?: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  showAnalytics?: boolean
}

const QuizComponentInner = ({
  quiz,
  mode,
  userState,
  onAnswerChange,
  onSubmit,
  onToggleShowCorrect,
  onReset,
  isSubmitting,
  isSubmitDisabled,
  onSave,
  onDelete,
  isDraft,
  onCancelDraft,
  isExpanded,
  onToggleExpand,
  showAnalytics = false,
}: QuizComponentProps) => {
  const [showIncompleteError, setShowIncompleteError] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isSubmittingNew, isDirty },
    setValue,
    getValues,
    reset,
  } = useForm<QuizFormValues>({
    resolver: zodResolver(QuizValidationSchema) as Resolver<QuizFormValues>,
    defaultValues: toQuizFormValues(quiz),
    mode: 'onSubmit',
  })

  const userActions = (
    <div className='flex flex-wrap items-center gap-3 md:gap-6 justify-end'>
      {userState?.status !== 'submitted' && (
        <div
          onClick={(e) => {
            if (isSubmitDisabled && userState?.status !== 'submitted') {
              e.preventDefault()
              setShowIncompleteError(true)
            }
          }}
        >
          <Button
            variant='primary'
            size='grid'
            className='w-fit'
            disabled={isSubmitDisabled || isSubmitting || isSubmittingNew}
            onClick={() => {
              setShowIncompleteError(false)
              onSubmit?.()
            }}
            aria-label='Odeslat odpovědi do kvízu'
          >
            <span className='sm:hidden'>Odeslat</span>
            <span className='hidden sm:inline'>Odeslat odpovědi</span>
          </Button>
        </div>
      )}

      {userState?.status === 'submitted' && (
        <Button
          variant='link'
          className='rounded-lg shadow-none'
          onClick={onToggleShowCorrect}
          aria-label={
            userState?.showCorrect
              ? 'Skrýt správné odpovědi'
              : 'Zobrazit správné odpovědi'
          }
        >
          {userState?.showCorrect ? (
            <>
              <span className='sm:hidden'>Skrýt odpovědi</span>
              <span className='hidden sm:inline'>Skrýt správné odpovědi</span>
            </>
          ) : (
            <>
              <span className='sm:hidden'>Zobrazit odpovědi</span>
              <span className='hidden sm:inline'>
                Zobrazit správné odpovědi
              </span>
            </>
          )}
        </Button>
      )}

      {userState?.status === 'submitted' && onReset && (
        <Button
          variant='primary'
          size='grid'
          className='w-fit'
          onClick={onReset}
        >
          Začít znovu
        </Button>
      )}
    </div>
  )

  const formValues = useWatch({
    control,
    defaultValue: toQuizFormValues(quiz),
  })
  const displayQuiz = mode === 'lecturer' ? formValues : quiz
  const selectedDifficulty = getQuizDifficultyOption(displayQuiz.difficulty)
  const difficultyMetaText = selectedDifficulty
    ? `${selectedDifficulty.label}`
    : null
  const totalQuestions = displayQuiz.questions?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(totalQuestions / pageSize))
  const clampPage = (page: number) => Math.max(0, Math.min(page, pageCount - 1))
  const safePageIndex = clampPage(pageIndex)
  const startIndex = safePageIndex * pageSize
  const endIndex = startIndex + pageSize
  const shouldPaginate = mode !== 'lecturer'
  const { data: quizAnalytics } = useQuery<QuizAnalyticsResponse | null>({
    queryKey: ['quizAnalytics', quiz.uuid],
    queryFn: () => getQuizAnalytics(courseId!, moduleId!, quiz.uuid!),
    enabled:
      Boolean(courseId) &&
      Boolean(isExpanded) &&
      mode === 'lecturer-preview' &&
      showAnalytics &&
      (displayQuiz.attemptsCount ?? 0) > 0,
  })

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand()
    }
  }

  // Lecturer edit functions
  const updateTitle = (title: string) => {
    const capitalizedTitle = handleCapitalizedInput(
      title,
      formValues.title ?? '',
    )
    setValue(`title`, capitalizedTitle, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const updateDifficulty = (difficulty: QuizDifficulty) => {
    setValue('difficulty', difficulty, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const updateQuestionText = (qIndex: number, text: string) => {
    const currentQuestion = formValues.questions?.[qIndex]?.question ?? ''
    const capitalizedText = handleCapitalizedInput(text, currentQuestion)
    setValue(`questions.${qIndex}.question`, capitalizedText, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const updateQuestionType = (qIndex: number, type: QuestionType) => {
    const oldQuestion = getValues(`questions.${qIndex}`)
    const newQuestion: Question =
      type === 'singleChoice'
        ? {
            uuid: oldQuestion.uuid,
            type: 'singleChoice',
            question: oldQuestion.question,
            options: oldQuestion.options,
            correctIndex: 0,
          }
        : {
            uuid: oldQuestion.uuid,
            type: 'multipleChoice',
            question: oldQuestion.question,
            options: oldQuestion.options,
            correctIndices: [0],
          }
    setValue(`questions.${qIndex}`, newQuestion, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const currentOption =
      formValues.questions?.[qIndex]?.options?.[optIndex] ?? ''
    const capitalizedValue = handleCapitalizedInput(value, currentOption)
    setValue(`questions.${qIndex}.options.${optIndex}`, capitalizedValue, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const toggleCorrectAnswer = (qIndex: number, optIndex: number) => {
    const question = getValues(`questions.${qIndex}`) as Question

    if (question.type === 'singleChoice') {
      question.correctIndex = optIndex
      setValue(`questions.${qIndex}.correctIndex`, optIndex, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } else {
      const indices = question.correctIndices || []
      const newIndices = indices.includes(optIndex)
        ? indices.filter((i) => i !== optIndex)
        : [...indices, optIndex]

      setValue(`questions.${qIndex}.correctIndices`, newIndices, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  const addOption = (qIndex: number) => {
    const currentOptions = getValues(`questions.${qIndex}.options`)
    setValue(`questions.${qIndex}.options`, [...currentOptions, ''], {
      shouldDirty: true,
      shouldValidate: false,
    })
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    const question = getValues(`questions.${qIndex}`)
    const newOptions = question.options.filter((item, i) => i !== optIndex)
    setValue(`questions.${qIndex}.options`, newOptions, { shouldDirty: true })

    if (question.type === 'singleChoice') {
      if (question.correctIndex === optIndex) {
        setValue(`questions.${qIndex}.correctIndex`, 0, {
          shouldDirty: true,
          shouldValidate: false,
        })
      } else if (question.correctIndex! > optIndex) {
        setValue(
          `questions.${qIndex}.correctIndex`,
          question.correctIndex! - 1,
          {
            shouldDirty: true,
            shouldValidate: false,
          },
        )
      }
    } else {
      const newIndices = (question.correctIndices || [])
        .filter((i) => i !== optIndex)
        .map((i) => (i > optIndex ? i - 1 : i))
      setValue(`questions.${qIndex}.correctIndices`, newIndices, {
        shouldDirty: true,
        shouldValidate: false,
      })
    }
  }

  const addQuestion = () => {
    const currentQuestions = getValues(`questions`)

    setValue(
      `questions`,
      [
        ...currentQuestions,
        {
          uuid: `temp-${Date.now()}`,
          type: 'singleChoice',
          question: '',
          options: ['', ''],
          correctIndex: 0,
        },
      ],
      {
        shouldDirty: true,
        shouldValidate: false,
      },
    )
  }

  const removeQuestion = (qIndex: number) => {
    const currentQuestions = getValues(`questions`)
    setValue(
      `questions`,
      currentQuestions.filter((item, i) => i !== qIndex),
      { shouldDirty: true, shouldValidate: false },
    )
  }

  const handleSave = handleSubmit(async (data) => {
    const formData = data as QuizFormValues
    await onSave?.({
      ...formData,
      difficulty: formData.difficulty!,
    })
    // Clear dirty state after successful save
    reset(formData)
    if (mode === 'lecturer' && !isDraft && onToggleExpand) {
      onToggleExpand()
    }
  })

  const handleCancelEdit = () => {
    if (isDraft) {
      onCancelDraft?.()
      return
    }
    reset(toQuizFormValues(quiz))
    setShowIncompleteError(false)
  }

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleSaveOnEnter(e, handleSave, handleCancelEdit)
  }

  return (
    <div className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
      {/* Header */}
      <div
        className={cn(
          'p-3.5 md:px-5 md:py-4 transition-colors',
          !isDraft && 'cursor-pointer hover:bg-gray-50',
        )}
        onClick={() => !isDraft && toggleExpand()}
      >
        <div className='flex items-center justify-between gap-2 sm:gap-4'>
          <div className='flex-1 min-w-0'>
            {/* quiz name */}
            {mode === 'lecturer' && isExpanded ? (
              <div className='flex items-start gap-1'>
                <div className='flex-1'>
                  <Textarea
                    className={cn(
                      'text-sm sm:text-md md:text-lg font-bold p-1 block w-full',
                      errors.title && 'border-destructive',
                    )}
                    variant={'ghost'}
                    value={displayQuiz.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateTitle(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder='Zadejte název kvízu'
                  />
                  {errors.title?.message && (
                    <p className='error-text'>{errors.title.message}</p>
                  )}
                  {errors.questions && !errors.title?.message && (
                    <p className='error-text'>{errors.questions.message}</p>
                  )}
                </div>

                <div className='flex items-center gap-1 sm:gap-2 shrink-0 self-center'>
                  {mode === 'lecturer' &&
                    isDirty &&
                    !isDraft &&
                    isDirtyText('hidden sm:inline-flex')}
                  {mode === 'lecturer' && isDraft ? (
                    <EditBtn
                      type='delete'
                      icon={X}
                      iconClassName='size-4 md:size-5'
                      onClick={(e) => {
                        e?.stopPropagation()
                        onCancelDraft?.()
                      }}
                      aria-label='Zrušit koncept kvízu'
                    />
                  ) : (
                    mode === 'lecturer' && (
                      <DeleteConfirmDialog
                        trigger={
                          <EditBtn
                            type='delete'
                            onClick={(e) => e?.stopPropagation()}
                            aria-label={`Smazat kvíz ${quiz.title}`}
                          />
                        }
                        itemName={quiz.title}
                        itemType='kvíz'
                        onConfirm={() => {
                          onDelete?.()
                        }}
                      />
                    )
                  )}

                  {!isDraft && (
                    <button
                      className='p-1.5 hover:bg-gray-200 rounded-lg transition-colors shrink-0 cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand()
                      }}
                      aria-label={isExpanded ? 'Sbalit kvíz' : 'Rozbalit kvíz'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp
                          size={20}
                          strokeWidth={2.5}
                          className='text-secondary'
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                          strokeWidth={2.5}
                          className='text-secondary'
                        />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-between gap-2 sm:gap-4'>
                <div className='flex-1 min-w-0'>
                  <Label
                    className={cn(
                      'text-sm sm:text-base md:text-lg font-bold leading-tight mb-1.5 sm:mb-3 block',
                    )}
                    variant={'name'}
                  >
                    {quiz.title}
                  </Label>
                </div>

                <div className='flex items-center gap-1 sm:gap-2 shrink-0 self-center'>
                  {/* {mode === 'lecturer' && isDirty && (
                    <span className='text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full whitespace-nowrap'>
                      Neuloženo
                    </span>
                  )} */}

                  {mode === 'lecturer' && isDraft ? (
                    <EditBtn
                      type='delete'
                      icon={X}
                      iconClassName='size-4 md:size-5'
                      onClick={(e) => {
                        e?.stopPropagation()
                        onCancelDraft?.()
                      }}
                      aria-label='Zrušit koncept kvízu'
                    />
                  ) : (
                    mode === 'lecturer' && (
                      <DeleteConfirmDialog
                        trigger={
                          <EditBtn
                            type='delete'
                            onClick={(e) => e?.stopPropagation()}
                            aria-label={`Smazat kvíz ${quiz.title}`}
                          />
                        }
                        itemName={quiz.title}
                        itemType='kvíz'
                        onConfirm={() => {
                          onDelete?.()
                        }}
                      />
                    )
                  )}

                  <button
                    className='p-1.5 hover:bg-gray-200 rounded-lg transition-colors shrink-0 cursor-pointer'
                    aria-label={isExpanded ? 'Sbalit kvíz' : 'Rozbalit kvíz'}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronUp
                        size={20}
                        strokeWidth={2.5}
                        className='text-secondary'
                      />
                    ) : (
                      <ChevronDown
                        size={20}
                        strokeWidth={2.5}
                        className='text-secondary'
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className='flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1'>
              {selectedDifficulty && (
                <span className='flex items-center gap-1 whitespace-nowrap'>
                  <img
                    src={selectedDifficulty.icon}
                    alt=''
                    aria-hidden='true'
                    className='h-6 w-6 shrink-0'
                  />
                  <span>{difficultyMetaText}</span>
                </span>
              )}
              <span className='flex items-center gap-1 whitespace-nowrap'>
                <CheckCircle size={14} className='text-primary shrink-0' />
                <span>{quiz.attemptsCount} vyplnění</span>
              </span>

              <span className='flex items-center gap-1 whitespace-nowrap'>
                <HelpCircle size={14} className='text-secondary shrink-0' />
                <span>
                  {formatQuestionsCount(displayQuiz.questions?.length ?? 0)}
                </span>
              </span>

              {showAnalytics && (displayQuiz.attemptsCount ?? 0) > 0 && (
                <span className='flex items-center gap-1 whitespace-nowrap font-medium'>
                  <span>Průměr:</span>
                  <span className='text-accent-teal'>
                    {displayQuiz.averagePercentage ?? 0}%
                  </span>
                </span>
              )}

              {mode === 'lecturer' &&
                isDirty &&
                !isDraft &&
                isDirtyText('inline-flex sm:hidden')}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='p-3 md:p-5 space-y-4 border-t border-gray-100 bg-gray-50/50'>
          {mode === 'lecturer' && (
            <div className='space-y-2'>
              <Label
                className='block text-xs font-semibold text-gray-600'
                variant='name'
              >
                Úroveň kvízu
              </Label>
              <div className='overflow-x-auto pb-1'>
                <div className='grid grid-cols-5 gap-2'>
                  {QUIZ_DIFFICULTY_OPTIONS.map((option) => {
                    const isSelected = displayQuiz.difficulty === option.value

                    return (
                      <Button
                        key={option.value}
                        variant='outline'
                        type='button'
                        onClick={() => updateDifficulty(option.value)}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-xl border cursor-pointer bg-background px-2 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-2.5 sm:text-sm',
                          isSelected
                            ? 'border-primary bg-primary/8 text-primary shadow-sm'
                            : 'border-border text-foreground hover:border-primary/40 hover:bg-primary/5',
                          errors.difficulty &&
                            !isSelected &&
                            'border-destructive/60',
                        )}
                        aria-pressed={isSelected}
                        aria-label={`Vybrat úroveň ${option.label}`}
                      >
                        <img
                          src={option.icon}
                          alt=''
                          aria-hidden='true'
                          className='h-5.5 w-5.5 shrink-0 sm:h-7 sm:w-7'
                        />
                        <span className='hidden md:inline whitespace-nowrap'>
                          {option.label}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>
              {errors.difficulty?.message && (
                <p className='error-text'>{errors.difficulty.message}</p>
              )}
            </div>
          )}

          {/* Questions */}
          {displayQuiz.questions
            ?.slice(
              shouldPaginate ? startIndex : 0,
              shouldPaginate ? endIndex : undefined,
            )
            .map((origQuestion, localIndex) => {
              const qIndex = shouldPaginate
                ? startIndex + localIndex
                : localIndex
              const question = origQuestion as Question
              const questionAnalytics = quizAnalytics?.questionAnalytics.find(
                (qa) => qa.uuid === question.uuid,
              )
              return (
                <Fragment key={question.uuid ?? qIndex}>
                  <QuizQuestion
                    question={question}
                    qIndex={qIndex}
                    mode={mode}
                    questionError={errors.questions?.[qIndex] as object}
                    questionAnalytics={
                      mode === 'lecturer-preview' && showAnalytics
                        ? questionAnalytics
                        : undefined
                    }
                    onQuestionTextUpdate={(text: string) =>
                      updateQuestionText(qIndex, text)
                    }
                    onQuestionTypeChange={(type) =>
                      updateQuestionType(qIndex, type)
                    }
                    onQuestionRemove={() => removeQuestion(qIndex)}
                    onOptionUpdate={(optIndex, value) =>
                      updateOption(qIndex, optIndex, value)
                    }
                    onOptionRemove={(optIndex) =>
                      removeOption(qIndex, optIndex)
                    }
                    onCorrectToggle={(optIndex) =>
                      toggleCorrectAnswer(qIndex, optIndex)
                    }
                    onAddOption={() => addOption(qIndex)}
                    onEditKeyDown={handleEditKeyDown}
                    // user props
                    userState={userState}
                    onAnswerChange={(questionId, answer) => {
                      setShowIncompleteError(false)
                      onAnswerChange?.(questionId, answer)
                    }}
                    showCorrectAnswers={
                      mode === 'lecturer-preview' ? showCorrect : undefined
                    }
                  />

                  {localIndex <
                    (shouldPaginate
                      ? Math.min(pageSize, totalQuestions - startIndex) - 1
                      : (displayQuiz.questions?.length ?? 0) - 1) && (
                    <hr className='border-b border mt-2 border-gray-100' />
                  )}
                </Fragment>
              )
            })}

          {shouldPaginate && (
            <QuizPageSwitcher
              pageCount={pageCount}
              currentPage={safePageIndex}
              onPageChange={(page) => setPageIndex(clampPage(page))}
            />
          )}

          {mode === 'lecturer' && (
            <Button
              variant='outline'
              size='default'
              onClick={addQuestion}
              className={cn(
                'w-full border-dashed border-2 py-1 text-sm sm:text-base hover:border-primary hover:bg-primary/5',
                errors.questions &&
                  !Array.isArray(errors.questions) &&
                  'border-destructive',
              )}
              aria-label='Přidat novou otázku'
            >
              <Plus size={20} />
              Přidat otázku
            </Button>
          )}

          {/* Footer Actions */}
          <div className='flex flex-col lg:mx-10 pt-3 border-t-2 border-gray-100'>
            {mode === 'user' ? (
              <div className='flex items-center justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                  {userState?.status === 'submitted' && userState.results && (
                    <Label
                      className='text-primary flex items-center gap-3'
                      size={'lg'}
                    >
                      <CheckCircle size={20} className='hidden sm:block' />
                      {userState.results.score} / {userState.results.maxScore}
                    </Label>
                  )}

                  {showIncompleteError && (
                    <p className='error-text'>
                      Zodpovězte prosím všechny otázky
                    </p>
                  )}
                </div>

                {userActions}
              </div>
            ) : mode === 'lecturer-preview' ? (
              <div className='flex justify-start'>
                <Button
                  variant='link'
                  className='rounded-lg shadow-none'
                  onClick={() => setShowCorrect((prev) => !prev)}
                  aria-label='Zobrazit správné odpovědi'
                >
                  {showCorrect ? (
                    <>
                      <span className='sm:hidden'>Skrýt odpovědi</span>
                      <span className='hidden sm:inline'>
                        Skrýt správné odpovědi
                      </span>
                    </>
                  ) : (
                    <>
                      <span className='sm:hidden'>Zobrazit odpovědi</span>
                      <span className='hidden sm:inline'>
                        Zobrazit správné odpovědi
                      </span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className='flex justify-end'>
                <Button
                  variant='primary'
                  size='grid'
                  onClick={() => {
                    handleSave()
                  }}
                  disabled={
                    isSubmitDisabled ||
                    isSubmitting ||
                    isSubmittingNew ||
                    !isDirty
                  }
                >
                  Uložit změny
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const QuizComponent = (props: QuizComponentProps) => {
  const resetKey = `${props.quiz.uuid}-${props.mode}`
  return <QuizComponentInner key={resetKey} {...props} />
}

export default QuizComponent
