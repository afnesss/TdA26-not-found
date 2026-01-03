import { forwardRef } from 'react'
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize'
import { cn } from '@/lib/utils'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, minRows = 1, maxRows = 10, ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        data-slot='textarea'
        className={cn(
          'w-full px-4 py-2 rounded-xl text-foreground text-sm md:text-base bg-background/90 border-2 border-gray-200 shadow-sm outline-none transition-all duration-300 hover:shadow-md focus:shadow-lg focus:border-accent-teal-light focus:ring-2 focus:ring-accent-teal/20 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'resize-none overflow-hidden',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
