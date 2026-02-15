import { Button } from '@/components/ui/button'
import type { CourseStatus } from '@/lib/schemas'
import { Play, Pause, Archive, Calendar, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colorStyles } from '@/lib/constants'
import EditBtn from '@/pages/dashboard/components/EditBtn'

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
            variant: 'outline' as const,
            primary: false,
          },
          {
            label: 'Spustit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
            primary: true,
          },
        ]
      case 'planned':
        return [
          {
            label: 'Do návrhu',
            icon: RotateCcw,
            status: 'draft' as CourseStatus,
            variant: 'outline' as const,
            primary: false,
          },
          {
            label: 'Spustit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
            primary: true,
          },
        ]
      case 'live':
        return [
          {
            label: 'Pozastavit',
            icon: Pause,
            status: 'paused' as CourseStatus,
            variant: 'grid' as const,
            primary: true,
          },
        ]
      case 'paused':
        return [
          {
            label: 'Ukončit',
            icon: Archive,
            status: 'archived' as CourseStatus,
            variant: 'outline' as const,
            primary: false,
          },
          {
            label: 'Obnovit',
            icon: Play,
            status: 'live' as CourseStatus,
            variant: 'grid' as const,
            primary: true,
          },
        ]
      case 'archived':
        return [
          {
            label: 'Obnovit',
            icon: RotateCcw,
            status: 'draft' as CourseStatus,
            variant: 'grid' as const,
            primary: true,
          },
        ]
      default:
        return []
    }
  }

  const actions = getActions()
  if (actions.length === 0) return null

  return (
    <div className={cn('flex gap-2 items-center ', className)}>
      {actions.map((action) => {
        const Icon = action.icon

        const handleClick = (e?: React.MouseEvent) => {
          e?.stopPropagation()
          onStatusChange(action.status)
        }

        const gridColorClasses =
          action.variant === 'grid'
            ? [
                'bg-linear-to-br',
                colorStyles.bg[courseColor as keyof typeof colorStyles.bg],
                colorStyles.text[courseColor as keyof typeof colorStyles.text],
              ]
            : []

        return (
          <Button
            key={action.status}
            variant={action.variant}
            size='sm'
            onClick={handleClick}
            className={cn(
              'h-8 px-3',
              gridColorClasses,
              !action.primary && 'hover:bg-muted',
            )}
          >
            <Icon className={cn('w-3.5 h-3.5 mr-1')} />
            <span className='text-xs font-medium'>{action.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
