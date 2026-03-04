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
    label: string
    className: string
  }
> = {
  draft: {
    label: 'Návrh',
    className: 'bg-muted text-muted-foreground ',
  },
  planned: {
    label: 'Naplánováno',
    className: 'bg-primary/20 text-primary ',
  },
  live: {
    label: 'Aktivní',
    className: 'bg-secondary text-secondary-foreground ',
  },
  paused: {
    label: 'Pozastaveno',
    className: 'bg-accent-teal/20 text-accent-teal',
  },
  archived: {
    label: 'Archivováno',
    className: 'bg-muted text-muted-foreground',
  },
}

export function CourseStateBadge({ status, className }: CourseStateBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.archived

  return (
    <Badge
      variant='secondary'
      className={cn(config.className ?? '', className ?? '')}
    >
      {config.label}
    </Badge>
  )
}
