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
import type { Question, QuizAnswer } from '@/lib/schemas'
import type { QuizState } from '@/lib/types'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { Check, Plus, X } from 'lucide-react'
import QuizOption from './QuizOption'
import { cn } from '@/lib/utils'
import type { FieldError } from 'react-hook-form'

type QuestionType = 'singleChoice' | 'multipleChoice'

type QuizQuestionProps = {
  question: Question
  qIndex: number
  mode: 'user' | 'lecturer'

  // Lecturer mode
  onQuestionTextUpdate?: (text: string) => void
  onQuestionTypeChange?: (type: QuestionType) => void
  onQuestionRemove?: () => void
  onOptionUpdate?: (optIndex: number, value: string) => void
  onOptionRemove?: (optIndex: number) => void
  onCorrectToggle?: (optIndex: number) => void
  onAddOption?: () => void
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
}

const QuizQuestion = ({
  question,
  qIndex,
  mode,
  onQuestionTextUpdate,
  onQuestionTypeChange,
  onQuestionRemove,
  onOptionUpdate,
  onOptionRemove,
  onCorrectToggle,
  onAddOption,
  userState,
  onAnswerChange,
  questionError,
}: QuizQuestionProps) => {
  // User mode answer logic
  const answer = question.uuid
    ? (userState?.answers as unknown as Record<string, QuizAnswer>)?.[
        question.uuid
      ]
    : undefined

  const isSubmitted = userState?.status === 'submitted'
  const showCorrect = userState?.showCorrect
  const hasOptionErrors = questionError?.options?.some(
    (error) => error !== undefined,
  )

  return (
    <div>
      {/* Question Header */}
      <div className='flex items-start gap-1.5 md:gap-3 mb-4'>
        {/* Question number and text wrapper */}
        <div className='flex items-start gap-1.5 md:gap-3 flex-1 min-w-0'>
          <span
            className='font-bold text-background text-base bg-primary w-6 md:w-8 h-6
          md:h-8 rounded-full flex items-center justify-center shrink-0 mt-1'
          >
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
                      className={cn(
                        'text-xs sm:text-sm font-medium flex-1 overflow-hidden px-2 block w-full',
                        questionError?.question && 'border-destructive',
                      )}
                      placeholder='Zadejte otázku'
                    />
                    <EditBtn
                      onClick={onQuestionRemove}
                      type='delete'
                      classNameBtn='md:hidden shrink-0'
                    />
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <Label
                      size='sm'
                      className='text-gray-600 shrink-0 hidden md:block'
                    >
                      Typ:
                    </Label>
                    <Select
                      value={question.type}
                      onValueChange={(value: QuestionType) =>
                        onQuestionTypeChange?.(value)
                      }
                    >
                      <SelectTrigger className='w-30 md:w-40'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='singleChoice'>
                          Jedna správná
                        </SelectItem>
                        <SelectItem value='multipleChoice'>
                          Více správných
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <EditBtn
                      onClick={onQuestionRemove}
                      type='delete'
                      classNameBtn='hidden md:flex shrink-0'
                    />
                  </div>
                </div>
              ) : (
                <div className='flex-1 flex items-center justify-between gap-2'>
                  <Label size='md' className='flex-1 text-xs sm:text-sm'>
                    {question.question}
                  </Label>

                  {mode === 'user' && isSubmitted && (
                    <div className='shrink-0'>
                      {userState.results?.correctPerQuestion[qIndex] ? (
                        <Check
                          className='text-secondary size-4 md:size-5'
                          strokeWidth={3}
                        />
                      ) : (
                        <X
                          className='text-destructive size-4 md:size-5'
                          strokeWidth={3}
                        />
                      )}
                    </div>
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

            return (
              <QuizOption
                key={optIndex}
                option={option}
                optIndex={optIndex}
                question={question}
                mode={mode}
                // Lecturer props
                isCorrect={isCorrect}
                onCorrectToggle={() => onCorrectToggle?.(optIndex)}
                onOptionUpdate={(value) => onOptionUpdate?.(optIndex, value)}
                onOptionRemove={() => onOptionRemove?.(optIndex)}
                canRemove={question.options.length > 2}
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
          <p className='error-text mt-2'>Všechny možnosti musí být vyplněné</p>
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
          >
            <Plus size={16} />
            Přidat možnost
          </Button>
        )}
      </div>
    </div>
  )
}

export default QuizQuestion
