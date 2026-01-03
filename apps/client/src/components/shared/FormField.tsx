import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type FormFieldProps = {
  label: string
  icon?: LucideIcon
  rightElement?: React.ReactNode
  inputProps?: InputHTMLAttributes<HTMLInputElement> & {
    className?: string
  }
}

const FormField = ({
  icon: Icon,
  label,
  rightElement,
  inputProps,
}: FormFieldProps) => {
  return (
    <div>
      <Label size={'sm'} className='pb-2'>
        {label}
      </Label>
      <div className='relative'>
        {Icon && (
          <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40' />
        )}
        <Input
          {...inputProps}
          className={`${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} ${inputProps?.className || ''}`}
        />
        {rightElement && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center'>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormField
