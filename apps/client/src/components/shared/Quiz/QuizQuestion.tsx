import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Question, QuizAnswer, QuestionAnalytics } from '@/lib/schemas'
import type { QuizState } from '@/lib/types'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { Check, Plus, X } from 'lucide-react'
import QuizOption from './QuizOption'
import { cn } from '@/lib/utils'
import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type QuestionType = 'singleChoice' | 'multipleChoice'

type QuizQuestionProps = {
  question: Question
  qIndex: number
  mode: 'user' | 'lecturer' | 'lecturer-preview'
  questionAnalytics?: QuestionAnalytics

  // Lecturer mode
  onQuestionTextUpdate?: (text: string) => void
  onQuestionTypeChange?: (type: QuestionType) => void
  onQuestionRemove?: () => void
  onOptionUpdate?: (optIndex: number, value: string) => void
  onOptionRemove?: (optIndex: number) => void
  onCorrectToggle?: (optIndex: number) => void
  onAddOption?: () => void
  onEditKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  questionError?: {
    question?: FieldError
    options?: FieldError[]
    correctIndex?: FieldError
    correctIndices?: FieldError
  }

  // User mode
  userState?: QuizState
  onAnswerChange?: (
    questionId: string,
    answer: { selectedIndex?: number; selectedIndices?: number[] },
  ) => void
  showCorrectAnswers?: boolean
}

const QuizQuestion = ({
  question,
  qIndex,
  mode,
  questionAnalytics,
  onQuestionTextUpdate,
  onQuestionTypeChange,
  onQuestionRemove,
  onOptionUpdate,
  onOptionRemove,
  onCorrectToggle,
  onAddOption,
  onEditKeyDown,
  userState,
  onAnswerChange,
  questionError,
  showCorrectAnswers,
}: QuizQuestionProps) => {
  const { t } = useTranslation('common')
  // User mode answer logic
  const answer = question.uuid
    ? (userState?.answers as unknown as Record<string, QuizAnswer>)?.[
        question.uuid
      ]
    : undefined

  const isSubmitted = userState?.status === 'submitted'
  const showCorrect = userState?.showCorrect ?? showCorrectAnswers
  const hasOptionErrors = questionError?.options?.some(
    (error) => error !== undefined,
  )

  return (
    <div>
      {/* Question Header */}
      <div
        className={cn(
          'flex gap-1.5 md:gap-3 mb-4',
          mode === 'user' && isSubmitted ? 'items-center' : 'items-start',
        )}
      >
        {/* Question number and text wrapper */}
        <div
          className={cn(
            'flex gap-1.5 md:gap-3 flex-1 min-w-0',
            (mode === 'user' && isSubmitted) || mode === 'lecturer-preview'
              ? 'items-center'
              : 'items-start',
          )}
        >
          <span className='font-bold text-background text-base bg-primary w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center shrink-0'>
            {qIndex + 1}
          </span>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              {mode === 'lecturer' ? (
                <div className='flex-1 flex flex-col md:flex-row gap-2'>
                  <div className='flex items-center gap-2 flex-1'>
                    <Textarea
                      variant='ghost'
                      value={question.question}
                      onChange={(e) => {
                        e.preventDefault()
                        onQuestionTextUpdate?.(e.target.value)
                      }}
                      onKeyDown={onEditKeyDown}
                      className={cn(
                        'text-xs sm:text-sm font-medium flex-1 overflow-hidden px-2 block w-full',
                        questionError?.question && 'border-destructive',
                      )}
                      placeholder={t('quizQuestion.questionPlaceholder')}
                    />
                    <EditBtn
                      onClick={onQuestionRemove}
                      actionType='delete'
                      classNameBtn='md:hidden shrink-0'
                      aria-label={t('quizQuestion.removeQuestionAria', {
                        index: qIndex + 1,
                      })}
                    />
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <Label
                      size='sm'
                      className='text-gray-600 shrink-0 hidden md:block'
                    >
                      {t('quizQuestion.typeLabel')}
                    </Label>
                    <Select
                      value={question.type}
                      onValueChange={(value: QuestionType) =>
                        onQuestionTypeChange?.(value)
                      }
                    >
                      <SelectTrigger className='w-30 md:w-40 cursor-pointer'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='singleChoice'>
                          {t('quizQuestion.typeSingle')}
                        </SelectItem>
                        <SelectItem value='multipleChoice'>
                          {t('quizQuestion.typeMultiple')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Analytics on small screens - next to select */}

                    <EditBtn
                      onClick={onQuestionRemove}
                      actionType='delete'
                      classNameBtn='hidden md:flex shrink-0'
                      aria-label={t('quizQuestion.removeQuestionAria', {
                        index: qIndex + 1,
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className={cn(mode === 'user' ? '' : 'flex-1')}>
                  <div className='flex items-center justify-between gap-2'>
                    <Label size='md' className='flex-1 text-xs sm:text-sm'>
                      {question.question}
                    </Label>

                    {questionAnalytics && (
                      <div className='flex items-center  text-xs lg:text-sm text-gray-600 shrink-0 '>
                        <span className='font-medium text-accent-teal'>
                          {t('quizQuestion.correctRate', {
                            rate: questionAnalytics.correctRate.toFixed(0),
                          })}
                        </span>
                      </div>
                    )}
                    {mode === 'user' && isSubmitted && (
                      <div className='shrink-0'>
                        {userState.results?.correctPerQuestion[qIndex] ? (
                          <Check
                            className='text-secondary p-1 rounded-full bg-secondary/30 size-5 md:size-6'
                            strokeWidth={3}
                          />
                        ) : (
                          <X
                            className='text-destructive p-1 rounded-full bg-destructive/30 size-5 md:size-6'
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {mode === 'user' && !isSubmitted && (
                    <p className='text-[10px] md:text-xs text-gray-500 mt-1 flex items-center gap-1.5'>
                      {question.type === 'singleChoice' ? (
                        <>
                          <span>{t('quizQuestion.selectOneHint')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('quizQuestion.selectManyHint')}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
            {questionError?.question && (
              <p className='error-text mt-1'>
                {questionError?.question?.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className='space-y-2.5 lg:pl-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4'>
          {question.options.map((option, optIndex) => {
            const isCorrect =
              question.type === 'singleChoice'
                ? question.correctIndex === optIndex
                : (question.correctIndices || []).includes(optIndex)

            const isSelected =
              question.type === 'singleChoice'
                ? answer?.selectedIndex === optIndex
                : (answer?.selectedIndices ?? []).includes(optIndex)

            const optionStats = questionAnalytics?.options.find(
              (opt) => opt.index === optIndex,
            )

            return (
              <QuizOption
                key={optIndex}
                option={option}
                optIndex={optIndex}
                question={question}
                mode={mode}
                selectedCount={
                  questionAnalytics ? optionStats?.selectedCount : undefined
                }
                // Lecturer props
                isCorrect={isCorrect}
                onCorrectToggle={() => onCorrectToggle?.(optIndex)}
                onOptionUpdate={(value) => onOptionUpdate?.(optIndex, value)}
                onOptionRemove={() => onOptionRemove?.(optIndex)}
                canRemove={question.options.length > 2}
                onEditKeyDown={onEditKeyDown}
                // User props
                isSelected={isSelected}
                isSubmitted={isSubmitted}
                showCorrect={showCorrect}
                onAnswerChange={() => {
                  if (question.uuid && onAnswerChange) {
                    if (question.type === 'singleChoice') {
                      onAnswerChange(question.uuid, {
                        selectedIndex: optIndex,
                      })
                    } else {
                      const current = answer?.selectedIndices || []
                      const newIndices = current.includes(optIndex)
                        ? current.filter((i) => i !== optIndex)
                        : [...current, optIndex]
                      onAnswerChange(question.uuid, {
                        selectedIndices: newIndices,
                      })
                    }
                  }
                }}
              />
            )
          })}
        </div>
        {mode === 'lecturer' && hasOptionErrors && !questionError?.question && (
          <p className='error-text mt-2'>
            {t('quizQuestion.allOptionsRequired')}
          </p>
        )}
        {mode === 'lecturer' &&
          questionError?.correctIndices &&
          !hasOptionErrors &&
          !questionError?.question && (
            <p className='error-text mt-2'>
              {questionError.correctIndices.message}
            </p>
          )}
        {mode === 'lecturer' && (
          <Button
            variant='outline'
            size='sm'
            onClick={onAddOption}
            className='w-full md:w-auto'
            aria-label={t('quizQuestion.addOptionAria', {
              index: qIndex + 1,
            })}
          >
            <Plus size={16} />
            {t('quizQuestion.addOption')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default QuizQuestion
