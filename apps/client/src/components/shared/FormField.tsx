import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { type TextareaAutosizeProps } from 'react-textarea-autosize'
import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Textarea } from '../ui/textarea'

type FormFieldProps =
  | {
      label: string
      icon?: LucideIcon
      rightElement?: React.ReactNode
      inputProps: InputHTMLAttributes<HTMLInputElement> & { className?: string }
      multiline?: false
    }
  | {
      label: string
      icon?: LucideIcon
      textareaProps: TextareaAutosizeProps & { className?: string }
      multiline: true
    }

const FormField = (props: FormFieldProps) => {
  const { label, icon: Icon } = props

  return (
    <>
      <Label size={'sm'}>{label}</Label>
      <div className='relative'>
        {Icon && (
          <Icon className='absolute left-3 top-2 sm:top-3 sm:w-5 w-4 h-4 sm:h-5 text-foreground/40' />
        )}

        {props.multiline ? (
          <Textarea
            minRows={1}
            maxRows={10}
            {...props.textareaProps}
            className={`${Icon ? 'pl-11!' : 'pl-4!'} ${props.textareaProps?.className || ''}pb-2`}
          />
        ) : (
          <>
            <Input
              {...props.inputProps}
              className={`${Icon ? 'pl-11!' : 'pl-4!'} ${props.rightElement ? 'pr-12' : 'pr-4'} ${props.inputProps?.className || ''}`}
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
