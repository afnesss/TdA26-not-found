import React from 'react'
import { Button } from '@/components/ui/button'

type TabButtonProps = {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  isActive: boolean
  onClick: () => void
  title: string
  isDisabled?: boolean
}

const TabButton = ({
  icon: Icon,
  isActive,
  onClick,
  title,
  isDisabled,
}: TabButtonProps) => {
  const disabled = Boolean(isDisabled)
  return (
    <Button
      variant={'filter'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
                ${
                  isActive
                    ? 'bg-primary text-background shadow-md'
                    : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
    >
      {Icon && <Icon className='w-4 h-4 hidden sm:block' />}
      {title}
    </Button>
  )
}

export default TabButton
