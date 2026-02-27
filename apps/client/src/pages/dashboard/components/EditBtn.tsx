import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EditBtnProps = {
  bgColor?: string
  icon?: LucideIcon | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  onClick?: (e?: React.MouseEvent) => void
  classNameBtn?: string
  type?: 'delete' | 'view'
  iconClassName?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const EditBtn: React.FC<EditBtnProps> = ({
  bgColor = 'gray',
  icon: Icon,
  onClick,
  classNameBtn,
  type,
  iconClassName,
  disabled,
  size = 'sm',
}) => {
  let hoverStyle = `hover:bg-${bgColor}-100`
  let textStyle = `text-${bgColor}`
  let IconToRender = Icon
  if (type === 'delete') {
    if (!IconToRender) IconToRender = Trash2
    textStyle = 'text-destructive'
    hoverStyle = 'hover:bg-destructive/10'
  } else if (type === 'view') {
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

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      disabled={disabled}
      className={cn(hoverStyle, sizeClasses[size], classNameBtn)}
      onClick={onClick}
    >
      {IconToRender && (
        <IconToRender
          className={cn(`${iconClasses[size]} ${textStyle}`, iconClassName)}
        />
      )}
    </Button>
  )
}

export default EditBtn
