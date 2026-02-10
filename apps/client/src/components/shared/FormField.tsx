import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { type TextareaAutosizeProps } from 'react-textarea-autosize'
import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Textarea } from '../ui/textarea'
import { cn } from '@/lib/utils'

type FormFieldProps =
  | {
      label: string
      icon?: LucideIcon
      rightElement?: React.ReactNode
      inputProps: InputHTMLAttributes<HTMLInputElement> & { className?: string }
      multiline?: false
      className?: string
    }
  | {
      label: string
      icon?: LucideIcon
      textareaProps: TextareaAutosizeProps & { className?: string }
      multiline: true
      className?: string
    }

const FormField = (props: FormFieldProps) => {
  const { label, icon: Icon } = props
  const fieldId = props.multiline
    ? props.textareaProps.id ||
      `field-${label.toLowerCase().replace(/\s+/g, '-')}`
    : props.inputProps.id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <>
      <Label size={'sm'} htmlFor={fieldId}>
        {label}
      </Label>
      <div className='relative'>
        {Icon && (
          <Icon
            className='absolute left-3 top-2 sm:top-3 sm:w-5 w-4 h-4 sm:h-5 text-foreground/40'
            aria-hidden='true'
          />
        )}

        {props.multiline ? (
          <Textarea
            minRows={1}
            maxRows={10}
            {...props.textareaProps}
            id={fieldId}
            className={cn(
              `${Icon ? 'pl-11!' : 'pl-4!'} ${props.textareaProps?.className || ''}pb-2`,
              props.className,
            )}
          />
        ) : (
          <>
            <Input
              {...props.inputProps}
              id={fieldId}
              className={cn(
                `${Icon ? 'pl-11!' : 'pl-4!'} ${props.rightElement ? 'pr-12' : 'pr-4'} ${props.inputProps?.className || ''}`,
                props.className,
              )}
            />
            {props.rightElement && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center'>
                {props.rightElement}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default FormField
