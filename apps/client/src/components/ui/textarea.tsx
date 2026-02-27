import { forwardRef } from 'react'
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize'
import { cn } from '@/lib/utils'
import { inputVariants } from './variants'
import type { VariantProps } from 'class-variance-authority'

interface InputProps
  extends TextareaAutosizeProps, VariantProps<typeof inputVariants> {}

const Textarea = forwardRef<HTMLTextAreaElement, InputProps>(
  (
    { className, variant = 'default', minRows = 1, maxRows = 10, ...props },
    ref,
  ) => {
    return (
      <TextareaAutosize
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        cacheMeasurements={false}
        data-variant={variant}
        data-slot='textarea'
        className={cn(
          inputVariants({ variant }),
          'resize-none overflow-hidden transition-[border-color,box-shadow,background-color] duration-300',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
