import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'

export type CourseStatus = 'draft' | 'planned' | 'live' | 'paused' | 'archived'

interface CourseStateBadgeProps {
  status: CourseStatus
  className?: string
}

const statusConfig: Record<
  CourseStatus,
  {
    labelKey: string
    className: string
  }
> = {
  draft: {
    labelKey: 'courseStatus.draft',
    className: 'bg-accent-teal-light/20 text-[#2D8B6B]',
  },
  planned: {
    labelKey: 'courseStatus.planned',
    className: 'bg-primary/20 text-primary',
  },
  live: {
    labelKey: 'courseStatus.live',
    className: 'bg-secondary/45 text-[#2D8B6B]',
  },
  paused: {
    labelKey: 'courseStatus.paused',
    className: 'bg-accent-teal/30 text-[#246969]',
  },
  archived: {
    labelKey: 'courseStatus.archived',
    className: 'bg-muted text-muted-foreground',
  },
}

export function CourseStateBadge({ status, className }: CourseStateBadgeProps) {
  const { t } = useTranslation('common')
  const config = statusConfig[status] ?? statusConfig.archived

  return (
    <Badge
      variant='secondary'
      className={cn(config.className ?? '', className ?? '')}
    >
      {t(config.labelKey)}
    </Badge>
  )
}
