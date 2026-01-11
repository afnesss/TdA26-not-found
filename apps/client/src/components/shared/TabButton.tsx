import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TabButtonProps = {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
  activeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
  isActive: boolean
  onClick: () => void
  title: string
  isDisabled?: boolean
  imgClassName?: string
}

const TabButton = ({
  icon,
  activeIcon,
  isActive,
  onClick,
  title,
  isDisabled,
  imgClassName,
}: TabButtonProps) => {
  const disabled = Boolean(isDisabled)

  const displayIcon = isActive && activeIcon ? activeIcon : icon

  const renderIcon = () => {
    if (!displayIcon) return null

    if (typeof displayIcon === 'string') {
      return (
        <img
          src={displayIcon}
          alt=''
          className={cn('w-3 h-3 hidden sm:block ', imgClassName)}
        />
      )
    } else {
      const IconComponent = displayIcon
      return <IconComponent className='w-4 h-4 hidden sm:block' />
    }
  }

  return (
    <Button
      variant={'filter'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${
          isActive
            ? 'bg-primary text-background shadow-md'
            : 'bg-background text-primary hover:bg-gray-50 border border-gray-200'
        }`}
    >
      {renderIcon()}
      {title}
    </Button>
  )
}

export default TabButton
