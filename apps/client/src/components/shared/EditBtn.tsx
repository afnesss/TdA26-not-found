import React from 'react'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EditBtnProps = {
  bgColor?: string
  icon: LucideIcon
  onClick?: () => void
  classNameBtn?: string
}

const EditBtn: React.FC<EditBtnProps> = ({
  bgColor = 'gray',
  icon: Icon,
  onClick,
  classNameBtn,
}) => {
  const hoverStyle = `hover:bg-${bgColor}-100`
  const textStyle = `text-${bgColor}`

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(hoverStyle, classNameBtn)}
      onClick={onClick}
    >
      <Icon className={`w-4 h-4 ${textStyle}`} />
    </Button>
  )
}

export default EditBtn
