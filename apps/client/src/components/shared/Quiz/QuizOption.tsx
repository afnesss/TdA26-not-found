import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/schemas'
import { X } from 'lucide-react'
import EditBtn from '@/pages/dashboard/components/EditBtn'

type QuizOptionProps = {
  option: string
  optIndex: number
  question: Question
  mode: 'user' | 'lecturer'

  // Lecturer mode
  isCorrect?: boolean
  onCorrectToggle?: () => void
  onOptionUpdate?: (value: string) => void
  onOptionRemove?: () => void
  canRemove?: boolean

  // User mode
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
  isCorrect = false,
  onCorrectToggle,
  onOptionUpdate,
  onOptionRemove,
  canRemove = true,
  isSelected = false,
  isSubmitted = false,
  showCorrect = false,
  onAnswerChange,
}: QuizOptionProps) => {
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
          placeholder='Zadejte možnost'
          className='text-xs md:text-sm'
        />

        {canRemove && (
          <EditBtn
            type='delete'
            icon={X}
            onClick={(e) => {
              e?.stopPropagation()
              onOptionRemove?.()
            }}
          />
        )}
      </div>
    )
  }

  // User mode
  return (
    <Label
      className={cn(
        'flex items-center gap-3 p-1.5 sm:p-2.5 md:p-3.5 rounded-lg transition-all border border-gray-200 bg-gray-100',
        !isSubmitted &&
          'cursor-pointer hover:bg-primary/20 hover:border-gray-300',
        isSelected && !showCorrect && !isSubmitted && 'bg-primary/10',
        isSelected && isSubmitted && !showCorrect && 'bg-gray-200',
        isSelected && isCorrect && showCorrect && 'bg-secondary/40',
        isSelected &&
          !isCorrect &&
          isSubmitted &&
          showCorrect &&
          'bg-destructive/30',
        !isSelected && isCorrect && showCorrect && 'border-secondary border-2',
      )}
    >
      <Checkbox
        variant={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
        checked={isSelected}
        disabled={isSubmitted}
        onCheckedChange={onAnswerChange}
      />
      <span className='text-xs sm:text-sm font-medium text-foreground'>
        {option}
      </span>
    </Label>
  )
}

export default QuizOption
