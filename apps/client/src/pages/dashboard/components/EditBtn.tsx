import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EditBtnProps = {
  bgColor?: string
  icon?: LucideIcon
  onClick?: (e?: React.MouseEvent) => void
  classNameBtn?: string
  type?: 'delete'
  iconClassName?: string
  disabled?: boolean
}

const EditBtn: React.FC<EditBtnProps> = ({
  bgColor = 'gray',
  icon: Icon,
  onClick,
  classNameBtn,
  type,
  iconClassName,
  disabled,
}) => {
  let hoverStyle = `hover:bg-${bgColor}-100`
  let textStyle = `text-${bgColor}`
  let IconToRender = Icon
  if (type === 'delete') {
    if (!IconToRender) IconToRender = Trash2
    textStyle = 'text-destructive'
    hoverStyle = 'hover:bg-destructive/10'
  }

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      disabled={disabled}
      className={cn(hoverStyle, 'size-6 lg:size-7', classNameBtn)}
      onClick={onClick}
    >
      {IconToRender && (
        <IconToRender
          className={cn(
            `w-3.5 h-3.5 sm:w-4 sm:h-4 ${textStyle}`,
            iconClassName,
          )}
        />
      )}
    </Button>
  )
}

export default EditBtn
