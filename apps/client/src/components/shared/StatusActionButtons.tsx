import { Button } from '@/components/ui/button'
import type { CourseStatus } from '@/lib/schemas'
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
import { useTranslation } from 'react-i18next'
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
  labels?: {
    schedule?: string
    copyAsDraft?: string
    copyShort?: string
    launch?: string
    toDraft?: string
    archive?: string
    pause?: string
    resume?: string
  }
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
  labels,
}: StatusActionButtonProps) {
  const isMd = useMediaQuery('(min-width: 768px)')
  const { t } = useTranslation('dashboard')

  const getActions = (): ActionButton[] => {
    switch (currentStatus) {
      case 'draft':
        return [
          {
            title: labels?.schedule ?? t('courseOverview.statusActions.schedule'),
            icon: Calendar,
            status: 'planned',
            variant: 'outline',
            primary: false,
          },
          {
            title:
              labels?.copyAsDraft ?? t('courseOverview.statusActions.copyAsDraft'),
            mobileLabel:
              labels?.copyShort ?? t('courseOverview.statusActions.copyShort'),
            icon: FilePlus,
            status: 'draft',
            variant: 'outline',
            primary: false,
            action: 'copy',
          },
          {
            label: labels?.launch ?? t('courseOverview.statusActions.launch'),
            title: labels?.launch ?? t('courseOverview.statusActions.launch'),
            icon: Play,
            status: 'live',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'planned':
        return [
          {
            label: labels?.toDraft ?? t('courseOverview.statusActions.toDraft'),
            title: labels?.toDraft ?? t('courseOverview.statusActions.toDraft'),
            icon: RotateCcw,
            status: 'draft',
            variant: 'outline',
            primary: false,
          },
          {
            label: labels?.launch ?? t('courseOverview.statusActions.launch'),
            title: labels?.launch ?? t('courseOverview.statusActions.launch'),
            icon: Play,
            status: 'live',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'live':
        return [
          {
            label: labels?.archive ?? t('courseOverview.statusActions.archive'),
            title: labels?.archive ?? t('courseOverview.statusActions.archive'),
            icon: Archive,
            status: 'archived',
            variant: 'outline',
            primary: false,
          },
          {
            label: labels?.pause ?? t('courseOverview.statusActions.pause'),
            title: labels?.pause ?? t('courseOverview.statusActions.pause'),
            icon: Pause,
            status: 'paused',
            variant: 'grid',
            primary: true,
          },
        ]
      case 'paused':
        return [
          {
            title: labels?.schedule ?? t('courseOverview.statusActions.schedule'),
            icon: Calendar,
            status: 'planned',
            variant: 'outline',
            primary: false,
          },
          {
            title: labels?.archive ?? t('courseOverview.statusActions.archive'),
            icon: Archive,
            status: 'archived',
            variant: 'outline',
            primary: false,
          },
          {
            label: labels?.resume ?? t('courseOverview.statusActions.resume'),
            title: labels?.resume ?? t('courseOverview.statusActions.resume'),
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
            label:
              labels?.copyAsDraft ?? t('courseOverview.statusActions.copyAsDraft'),
            title:
              labels?.copyAsDraft ?? t('courseOverview.statusActions.copyAsDraft'),
            mobileLabel:
              labels?.copyShort ?? t('courseOverview.statusActions.copyShort'),
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
          if (action.action === 'copy' && onCopyAsDraft) {
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
            key={`${action.status}-${action.action ?? 'status'}`}
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
                ((isMd && action.label) ||
                  (!isMd &&
                    action.primary &&
                    (action.mobileLabel || action.label))) &&
                  'mr-1',
              )}
            />
            <span
              className={cn(
                ' inline text-xs font-medium',
                !isMd && !action.primary && 'hidden',
                labelClassName,
              )}
            >
              {(!isMd && action.primary && action.mobileLabel) ||
                action.label ||
                ''}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
