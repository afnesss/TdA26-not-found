import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Lock, Unlock } from 'lucide-react'
import type { MouseEventHandler } from 'react'

type ModuleVisibilityActionButtonProps = {
  status: 'active' | 'passive'
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
  title?: string
}

const ModuleVisibilityActionButton = ({
  status,
  onClick,
  disabled,
  className,
  title,
}: ModuleVisibilityActionButtonProps) => {
  const isActive = status === 'active'

  return (
    <Button
      variant={isActive ? 'outline' : 'grid'}
      size='sm'
      className={cn(
        'h-8 ',
        !isActive &&
          cn(
            'bg-linear-to-br font-medium text-xs md:text-sm',
            colorStyles.bg.secondary,
            colorStyles.text.secondary,
          ),
        className,
        isActive && 'text-muted-foreground',
      )}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {isActive ? (
        <Lock className='w-3.5 h-3.5 md:mr-1' />
      ) : (
        <Unlock className='w-3.5 h-3.5 md:mr-1' />
      )}
      <span className='hidden md:inline-block'>
        {' '}
        {isActive ? 'Skrýt' : 'Aktivovat'}
      </span>
    </Button>
  )
}

export default ModuleVisibilityActionButton
