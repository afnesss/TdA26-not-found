import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Lock, Unlock } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { useTranslation } from 'react-i18next'

type ModuleVisibilityActionButtonProps = {
  status: 'active' | 'passive'
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
  title?: string
  activeLabel?: string
  passiveLabel?: string
}

const ModuleVisibilityActionButton = ({
  status,
  onClick,
  disabled,
  className,
  title,
  activeLabel,
  passiveLabel,
}: ModuleVisibilityActionButtonProps) => {
  const { t } = useTranslation('dashboard')
  const isActive = status === 'active'
  const resolvedActiveLabel = activeLabel ?? t('moduleDetail.visibility.hide')
  const resolvedPassiveLabel =
    passiveLabel ?? t('moduleDetail.visibility.activate')

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
        {isActive ? resolvedActiveLabel : resolvedPassiveLabel}
      </span>
    </Button>
  )
}

export default ModuleVisibilityActionButton
