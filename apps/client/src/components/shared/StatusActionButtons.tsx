import { Button } from '@/components/ui/button'
import type { CourseStatus, CourseSummary } from '@/lib/schemas'
import {
  Play,
  Pause,
  Archive,
  Calendar,
  RotateCcw,
  FilePlus,
  type LucideProps,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { colorStyles } from '@/lib/constants'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { useMediaQuery } from 'usehooks-ts'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface StatusActionButtonProps {
  currentStatus: CourseStatus
  onStatusChange: (newStatus: CourseStatus) => void
  courseColor: string
  className?: string
  buttonClassName?: string
  iconClassName?: string
  labelClassName?: string
  onCopyAsDraft?: () => void
  hideCopyAsDraft?: boolean
}

type ActionButton = {
  label?: string
  mobileLabel?: string
  title: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  status: CourseStatus
  variant: 'outline' | 'grid'
  primary: boolean
  action?: 'copy' | undefined
}

export function StatusActionButtons({
  currentStatus,
  onStatusChange,
  courseColor,
  className,
  buttonClassName,
  iconClassName,
  labelClassName,
  onCopyAsDraft,
  hideCopyAsDraft = false,
}: StatusActionButtonProps) {
  const isMd = useMediaQuery('(min-width: 768px)')
  const getActions = (): ActionButton[] => {
    switch (currentStatus) {
      case 'draft':
        return [
          {
            title: 'Naplánovat',
            icon: Calendar,
            status: 'planned',
            variant: 'outline',
            primary: false,
          },
          {
            title: 'Kopírovat jako návrh',
            mobileLabel: 'Kopírovat',
            icon: FilePlus,
            status: 'draft',
            variant: 'outline',
            primary: false,
            action: 'copy',
          },
          {
            label: 'Spustit',
            title: 'Spustit',
            icon: Play,
            status: 'live',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'planned':
        return [
          {
            label: 'Do návrhu',
            title: 'Do návrhu',
            icon: RotateCcw,
            status: 'draft',
            variant: 'outline',
            primary: false,
          },
          {
            label: 'Spustit',
            title: 'Spustit',
            icon: Play,
            status: 'live',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'live':
        return [
          {
            label: 'Archivovat',
            title: 'Archivovat',
            icon: Archive,
            status: 'archived',
            variant: 'outline',
            primary: false,
          },
          {
            label: 'Pozastavit',
            title: 'Pozastavit',
            icon: Pause,
            status: 'paused',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'paused':
        return [
          {
            title: 'Naplánovat',
            icon: Calendar,
            status: 'planned',
            variant: 'outline',
            primary: false,
          },
          {
            title: 'Archivovat',
            icon: Archive,
            status: 'archived',
            variant: 'outline',
            primary: false,
          },
          {
            label: 'Obnovit',
            title: 'Obnovit',
            icon: Play,
            status: 'live',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'archived':
        if (hideCopyAsDraft) return []
        return [
          {
            label: 'Kopírovat jako návrh',
            title: 'Kopírovat jako návrh',
            mobileLabel: 'Kopírovat',
            icon: FilePlus,
            status: 'draft',
            variant: 'grid',
            primary: true,
            action: 'copy',
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
          if (action.action && action.action === 'copy' && onCopyAsDraft) {
            onCopyAsDraft()
            return
          }
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
              !action.primary && 'hover:bg-muted text-muted-foreground',
              buttonClassName,
              !action.label && 'gap-0',
            )}
            title={!action.label || !isMd ? action.title : ''}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                iconClassName,
                action.label && 'md:mr-1',
              )}
            />
            <span
              className={cn(
                'hidden md:inline text-xs font-medium',
                labelClassName,
              )}
            >
              {action.label ?? ''}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
