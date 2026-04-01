import type { CourseSessionOverview } from '@/api/queries/courseQueries'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Trophy } from 'lucide-react'
import { useState } from 'react'

type LeaderboardEntry = CourseSessionOverview['leaderboard'][number]

type CourseLeaderboardProps = {
  leaderboard: CourseSessionOverview['leaderboard']
  emptyMessage?: string
}

const MEDAL_CONFIG = {
  1: {
    icon: 'text-yellow-400',
    card: 'bg-amber-50/70',
    stat: 'bg-amber-100/60 text-amber-800',
    bar: 'bg-amber-300',
    track: 'bg-amber-100',
  },
  2: {
    icon: 'text-slate-400',
    card: 'bg-slate-50/70',
    stat: 'bg-slate-100/60 text-slate-600',
    bar: 'bg-slate-300',
    track: 'bg-slate-100',
  },
  3: {
    icon: 'text-amber-600',
    card: 'bg-orange-50/70',
    stat: 'bg-orange-100/60 text-orange-700',
    bar: 'bg-orange-300',
    track: 'bg-orange-100',
  },
} as const

const StatusBadge = ({
  completed,
  className,
}: {
  completed: boolean
  className?: string
}) =>
  completed ? (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary',
        className,
      )}
    >
      <CheckCircle2 className='size-3' />
      Dokončil kurz
    </span>
  ) : (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-accent-teal/12 px-2 py-0.5 text-xs font-semibold text-accent-teal',
        className,
      )}
    >
      <Clock className='size-3' />
      Vyplňuje kurz
    </span>
  )

const MedalCard = ({ entry }: { entry: LeaderboardEntry }) => {
  const config = MEDAL_CONFIG[entry.rank as 1 | 2 | 3]
  const isCompleted = entry.status === 'completed'
  const progress = Math.max(0, Math.min(100, entry.progressPercent))

  return (
    <div className={cn('rounded-2xl p-3.5 transition-all duration-200', config.card)}>
      <div className='flex items-center gap-2.5'>
        <Trophy className={cn('size-4 shrink-0', config.icon)} strokeWidth={2.5} />

        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate text-sm font-bold md:text-base'>{entry.username}</p>
            <StatusBadge completed={isCompleted} className='shrink-0' />
          </div>

          {/* Progress bar */}
          <div className={cn('mt-2 h-1 w-full overflow-hidden rounded-full', config.track)}>
            <div
              className={cn('h-full rounded-full transition-all duration-500', config.bar)}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats */}
          <div className='mt-1.5 flex flex-wrap gap-1.5'>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', config.stat)}>
              Úspěšnost {entry.successRate == null ? '—' : `${entry.successRate}%`}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', config.stat)}>
              Vyplněno {entry.completedQuizzes}/{entry.totalQuizzes}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', config.stat)}>
              Pokusy {entry.submissionsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const RestEntry = ({ entry }: { entry: LeaderboardEntry }) => {
  const isCompleted = entry.status === 'completed'
  const progress = Math.max(0, Math.min(100, entry.progressPercent))

  return (
    <div className='flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/20 md:px-4'>
      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
        {entry.rank}
      </span>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold'>{entry.username}</p>
        <div className='mt-0.5 flex flex-wrap gap-1 text-[11px]'>
          <span className='rounded-full bg-muted/40 px-2 py-0.5 text-muted-foreground'>
            Úspěšnost {entry.successRate == null ? '—' : `${entry.successRate}%`}
          </span>
          <span className='rounded-full bg-muted/40 px-2 py-0.5 text-muted-foreground'>
            Vyplněno {entry.completedQuizzes}/{entry.totalQuizzes}
          </span>
          <span className='rounded-full bg-muted/40 px-2 py-0.5 text-muted-foreground'>
            Pokusy {entry.submissionsCount}
          </span>
        </div>
      </div>

      <StatusBadge completed={isCompleted} className='shrink-0' />
    </div>
  )
}

const CourseLeaderboard = ({
  leaderboard,
  emptyMessage = 'Zatím žádná studentská odevzdání.',
}: CourseLeaderboardProps) => {
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className='space-y-2 rounded-2xl border border-border/70 bg-linear-to-br from-background via-background to-muted/15 p-4 shadow-sm'>
      {leaderboard.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{emptyMessage}</p>
      ) : (
        <>
          <div className='space-y-1.5'>
            {top3.map((entry) => (
              <MedalCard key={entry.userId} entry={entry} />
            ))}
          </div>

          {rest.length > 0 && (
            <div className='overflow-hidden rounded-xl border border-border/70 bg-background/80'>
              {isExpanded && (
                <div className='divide-y divide-border/60'>
                  {rest.map((entry) => (
                    <RestEntry key={entry.userId} entry={entry} />
                  ))}
                </div>
              )}
              <button
                type='button'
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground',
                  isExpanded && 'border-t border-border/60',
                )}
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? 'Zobrazit méně' : `Zobrazit další (${rest.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CourseLeaderboard
