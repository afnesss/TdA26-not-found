import React from 'react'
import {
  Search,
  AlertCircle,
  BookOpen,
  FileQuestion,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import fileImg from '../../assets/files-blue.svg'

type StateType =
  | 'empty-search'
  | 'error'
  | 'no-content'
  | 'not-found'
  | 'network-offline'

type Props = {
  type: StateType
  onAction?: () => void
  message?: string
  actionText?: string
  className?: string
  icon?: LucideIcon
  img?: string
  iconClassName?: string
}

const StateComp = ({
  type,
  onAction,
  message,
  actionText,
  className,
  icon,
  iconClassName,
  img,
}: Props) => {
  const stateConfig: Record<
    StateType,
    {
      icon?: LucideIcon
      img?: string
      iconBg: string
      iconColor: string
      defaultMessage: string
      defaultAction: string
      showButton: boolean
    }
  > = {
    'empty-search': {
      icon: Search,
      iconBg: 'bg-secondary/20',
      iconColor: 'text-primary',
      defaultMessage: 'Žádné kurzy nenalezeny',
      defaultAction: 'Vymazat vyhledávání',
      showButton: true,
    },
    error: {
      icon: AlertCircle,
      iconBg: 'bg-destructive/20',
      iconColor: 'text-destructive/70',
      defaultMessage: 'Něco se pokazilo',
      defaultAction: 'Zkusit znovu',
      showButton: true,
    },
    'no-content': {
      img: fileImg,
      iconBg: 'bg-secondary/20',
      iconColor: 'text-primary',
      defaultMessage: 'Zatím nemáte žádné kurzy',
      defaultAction: 'Vytvořit kurz',
      showButton: true,
    },
    'not-found': {
      icon: FileQuestion,
      iconBg: 'bg-secondary/20',
      iconColor: 'text-primary',
      defaultMessage: 'Kurz nebyl nalezen',
      defaultAction: 'Zpět na kurzy',
      showButton: true,
    },
    'network-offline': {
      icon: WifiOff,
      iconBg: 'bg-destructive/20',
      iconColor: 'text-destructive/70',
      defaultMessage: 'Žádné připojení k internetu',
      defaultAction: 'Zkusit znovu',
      showButton: true,
    },
  }

  const config = stateConfig[type]
  const finalImg = img ?? config.img
  const IconComp = icon ?? config.icon

  return (
    <div className={cn('text-center py-16', className)}>
      <div
        className={`w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 ${config.iconBg} rounded-full flex items-center 
                  justify-center mx-auto mb-6`}
      >
        {finalImg ? (
          <img
            src={finalImg}
            className={cn('w-8 h-8 md:w-9 md:h-9', iconClassName)}
          />
        ) : IconComp ? (
          <IconComp
            className={cn('size-9 md:size-10 lg:size-11', config.iconColor)}
          />
        ) : null}
      </div>
      <div className='flex flex-col items-center'>
        <Label variant='emptyState' size='lg'>
          {message || config.defaultMessage}
        </Label>

        {config.showButton && onAction && (
          <Button
            variant='primary'
            size='primary'
            onClick={onAction}
            className=' w-fit'
            aria-label={actionText || config.defaultAction}
          >
            {actionText || config.defaultAction}
          </Button>
        )}
      </div>
    </div>
  )
}

export default StateComp
