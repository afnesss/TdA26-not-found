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
}

const EditBtn: React.FC<EditBtnProps> = ({
  bgColor = 'gray',
  icon: Icon,
  onClick,
  classNameBtn,
  type,
  iconClassName,
}) => {
  let hoverStyle = `hover:bg-${bgColor}-100`
  let textStyle = `text-${bgColor}`
  if (type === 'delete') {
    Icon = Trash2
    textStyle = 'text-destructive'
    hoverStyle = 'hover:bg-destructive/10'
  }

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      className={cn(hoverStyle, 'size-6 min-[400px]:size-7', classNameBtn)}
      onClick={onClick}
    >
      {Icon && <Icon className={cn(`w-4 h-4 ${textStyle}`, iconClassName)} />}
    </Button>
  )
}

export default EditBtn
