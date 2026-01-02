import React from 'react'
import { Search, AlertCircle, BookOpen } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type StateType = 'empty-search' | 'error' | 'no-content'

type Props = {
  type: StateType
  onAction?: () => void
  message?: string
  actionText?: string
}

const StateComp = ({ type, onAction, message, actionText }: Props) => {
  const stateConfig = {
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
      iconBg: 'bg-destruktive/20',
      iconColor: 'text-destruktive/60',
      defaultMessage: 'Něco se pokazilo',
      defaultAction: 'Zkusit znovu',
      showButton: true,
    },
    'no-content': {
      icon: BookOpen,
      iconBg: 'bg-secondary/20',
      iconColor: 'text-primary',
      defaultMessage: 'Zatím nemáte žádné kurzy',
      defaultAction: 'Vytvořit kurz',
      showButton: true,
    },
  }

  const config = stateConfig[type]
  const Icon = config.icon

  return (
    <div className='text-center py-16'>
      <div
        className={`w-22 h-22 ${config.iconBg} rounded-full flex items-center 
                  justify-center mx-auto mb-6`}
      >
        <Icon size={45} className={config.iconColor} />
      </div>

      <Label asChild variant='emptyState' size='xl'>
        <h3>{message || config.defaultMessage}</h3>
      </Label>

      {config.showButton && onAction && (
        <Button
          variant='primary'
          size='primary'
          onClick={onAction}
          className='mt-6'
        >
          {actionText || config.defaultAction}
        </Button>
      )}
    </div>
  )
}

export default StateComp
