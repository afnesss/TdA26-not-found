import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/schemas'
import { X } from 'lucide-react'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { useTranslation } from 'react-i18next'

type QuizOptionProps = {
  option: string
  optIndex: number
  question: Question
  mode: 'user' | 'lecturer' | 'lecturer-preview'
  selectedCount?: number
  isCorrect?: boolean
  onCorrectToggle?: () => void
  onOptionUpdate?: (value: string) => void
  onOptionRemove?: () => void
  canRemove?: boolean
  onEditKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  isSelected?: boolean
  isSubmitted?: boolean
  showCorrect?: boolean
  onAnswerChange?: () => void
}

const QuizOption = ({
  option,
  optIndex,
  question,
  mode,
  selectedCount,
  isCorrect = false,
  onCorrectToggle,
  onOptionUpdate,
  onOptionRemove,
  canRemove = true,
  onEditKeyDown,
  isSelected = false,
  isSubmitted = false,
  showCorrect = false,
  onAnswerChange,
}: QuizOptionProps) => {
  const { t } = useTranslation('common')

  if (mode === 'lecturer') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg transition-all border-2',
          isCorrect
            ? 'border-secondary bg-secondary/10'
            : 'border-gray-200 bg-gray-50',
        )}
      >
        <Checkbox
          variant={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
          checked={isCorrect}
          onCheckedChange={onCorrectToggle}
        />

        <Textarea
          variant='ghost'
          value={option}
          onChange={(e) => onOptionUpdate?.(e.target.value)}
          onKeyDown={onEditKeyDown}
          placeholder={t('quizOption.placeholder')}
          className='text-xs md:text-sm flex-1'
        />

        {canRemove && (
          <EditBtn
            actionType='delete'
            icon={X}
            onClick={(e) => {
              e?.stopPropagation()
              onOptionRemove?.()
            }}
            aria-label={t('quizOption.removeAria', { index: optIndex + 1 })}
          />
        )}
      </div>
    )
  }

  const getAnswerState = (): 'correct' | 'incorrect' | 'none' => {
    if (!showCorrect) return 'none'
    if (isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'incorrect'
    return 'none'
  }

  return (
    <Label
      className={cn(
        'flex items-center justify-between p-1.5 sm:p-2.5 md:p-3.5 rounded-lg transition-all border border-gray-200 bg-gray-100',
        !isSubmitted &&
          'cursor-pointer hover:bg-primary/20 hover:border-gray-300',
        isSelected && !showCorrect && !isSubmitted && 'bg-primary/10',
        isSelected && isSubmitted && !showCorrect && 'bg-gray-200',
        isSelected && isCorrect && showCorrect && 'bg-secondary/40',
        mode === 'lecturer-preview' &&
          showCorrect &&
          isCorrect &&
          !isSelected &&
          'bg-secondary/40',
        isSelected &&
          !isCorrect &&
          isSubmitted &&
          showCorrect &&
          'bg-destructive/30',
        !isSelected &&
          isCorrect &&
          showCorrect &&
          mode !== 'lecturer-preview' &&
          'border-secondary border-2',
        mode === 'lecturer-preview' && 'cursor-default',
      )}
    >
      <div className='flex items-center gap-3'>
        <Checkbox
          variant={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
          checked={isSelected}
          disabled={isSubmitted}
          onCheckedChange={onAnswerChange}
          answerState={getAnswerState()}
          aria-label={t('quizOption.choiceAria', {
            index: optIndex + 1,
            option,
          })}
          className={cn(mode === 'lecturer-preview' && 'cursor-default')}
        />
        <span className='text-xs sm:text-sm font-medium text-foreground'>
          {option}
        </span>
      </div>
      {selectedCount !== undefined && selectedCount !== 0 && (
        <span className='text-sm md:text-base text-accent-teal h-5 w-5 md:h-6 md:w-6 font-medium shrink-0 min-w-5 rounded-full bg-accent-teal/20 text-center'>
          {selectedCount}x
        </span>
      )}
    </Label>
  )
}

export default QuizOption
