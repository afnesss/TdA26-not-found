import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EditBtnProps = {
  bgColor?: string
  icon?: LucideIcon | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  classNameBtn?: string
  actionType?: 'delete' | 'view'
  iconClassName?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  labelClassName?: string
} & Omit<React.ComponentProps<typeof Button>, 'size' | 'onClick' | 'children'>

const EditBtn = React.forwardRef<HTMLButtonElement, EditBtnProps>(
  (
    {
      bgColor = 'gray',
      icon: Icon,
      onClick,
      classNameBtn,
      actionType,
      variant = 'ghost',
      iconClassName,
      disabled,
      size = 'sm',
      label,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    let hoverStyle = `hover:bg-${bgColor}-100`
    let textStyle = `text-${bgColor}`
    let IconToRender = Icon
    if (actionType === 'delete') {
      if (!IconToRender) IconToRender = Trash2
      textStyle = 'text-destructive'
      hoverStyle = 'hover:bg-destructive/10'
    } else if (actionType === 'view') {
      if (!IconToRender) IconToRender = Eye
    }

    const sizeClasses = {
      sm: 'size-6 lg:size-7',
      md: 'size-8 lg:size-9',
      lg: 'size-9 lg:size-10',
    }

    const iconClasses = {
      sm: 'w-3.5 h-3.5 sm:w-4 h-4',
      md: 'w-4 h-4 sm:w-5 h-5',
      lg: 'w-5 h-5 sm:w-6 h-6',
    }

    const buttonSize = label ? 'sm' : 'icon-sm'

    const sizeClassName = label ? '' : sizeClasses[size]

    return (
      <Button
        ref={ref}
        variant={variant}
        size={buttonSize}
        disabled={disabled}
        className={cn(hoverStyle, sizeClassName, classNameBtn)}
        onClick={onClick}
        {...props}
      >
        <span className='inline-flex items-center gap-1'>
          {IconToRender && (
            <IconToRender
              className={cn(`${iconClasses[size]} ${textStyle}`, iconClassName)}
            />
          )}
          {label ? (
            <span
              className={cn(
                'text-xs font-medium whitespace-nowrap text-current',
                labelClassName,
              )}
            >
              {label}
            </span>
          ) : null}
        </span>
      </Button>
    )
  },
)

EditBtn.displayName = 'EditBtn'

export default EditBtn
