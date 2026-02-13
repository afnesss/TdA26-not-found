import { Button } from '@/components/ui/button'
import type { CourseStatus } from '@/lib/schemas'
import { Play, Pause, Archive, Calendar, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colorStyles } from '@/lib/constants'

interface StatusActionButtonProps {
  currentStatus: CourseStatus
  onStatusChange: (newStatus: CourseStatus) => void
  courseColor: string
  className?: string
}

export function StatusActionButtons({
  currentStatus,
  onStatusChange,
  courseColor,
  className,
}: StatusActionButtonProps) {
  const getActions = () => {
    switch (currentStatus) {
      case 'draft':
        return [
          {
            label: 'Naplánovat',
            icon: Calendar,
            status: 'planned' as CourseStatus,
            variant: 'secondary' as const,
          },
          {
            label: 'Spustit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
          },
        ]
      case 'planned':
        return [
          {
            label: 'Koncept',
            icon: RotateCcw,
            status: 'draft' as CourseStatus,
            variant: 'outline' as const,
          },
          {
            label: 'Spustit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
          },
        ]
      case 'live':
        return [
          {
            label: 'Ukončit',
            icon: Archive,
            status: 'archived' as CourseStatus,
            variant: 'ghost' as const,
          },
          {
            label: 'Pozastavit',
            icon: Pause,
            status: 'paused' as CourseStatus,
            variant: 'outline' as const,
          },
        ]
      case 'paused':
        return [
          {
            label: 'Ukončit',
            icon: Archive,
            status: 'archived' as CourseStatus,
            variant: 'ghost' as const,
          },
          {
            label: 'Obnovit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
          },
        ]
      case 'archived':
        return [
          {
            label: 'Obnovit',
            icon: RotateCcw,
            status: 'draft' as CourseStatus,
            variant: 'outline' as const,
          },
        ]
      default:
        return []
    }
  }

  const actions = getActions()

  if (actions.length === 0) return null

  return (
    <div className={cn('flex gap-1.5 flex-wrap', className)}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.status}
            variant={action.variant}
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(action.status)
            }}
            className={cn(
              'text-xs h-7 px-2',
              action.variant === 'grid' && [
                'bg-linear-to-br',
                colorStyles.bg[courseColor as keyof typeof colorStyles.bg],
                colorStyles.text[courseColor as keyof typeof colorStyles.text],
              ],
            )}
          >
            <Icon className='w-3 h-3 mr-1' />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
