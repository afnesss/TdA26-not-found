import type { CourseSessionOverview } from '@/api/queries/courseQueries'
import feedImg from '@/assets/disconnect-blue.svg'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleX, Clock3, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Label } from '../ui/label'
import StateComp from './StateComp'

type LeaderboardEntry = CourseSessionOverview['leaderboard'][number]

type CourseLeaderboardProps = {
  leaderboard: CourseSessionOverview['leaderboard']
  emptyMessage?: string
  showLeaderTrophy?: boolean
}

const RANK_STYLES = {
  1: {
    card: 'bg-amber-50',
    circle: 'bg-amber-200/70 text-amber-700 size-6 sm:size-7',
    accent: 'text-amber-800',
  },
  2: {
    card: 'bg-muted',
    circle: 'bg-muted-foreground/15 text-muted-foreground/80 size-6 sm:size-7',
    accent: 'text-muted-foreground',
  },
  3: {
    card: 'bg-orange-100/60',
    circle: 'bg-orange-200/70 text-orange-700 size-6 sm:size-7',
    accent: 'text-orange-800',
  },
  default: {
    card: 'bg-sky-50/55',
    circle: 'bg-sky-100 text-primary size-6 sm:size-6 sm:ml-0.5',
    accent: 'text-foreground',
  },
} as const

const getRankStyle = (rank: number) =>
  RANK_STYLES[rank as 1 | 2 | 3] ?? RANK_STYLES.default

const formatAttemptsLabel = (attempts: number) => {
  if (attempts === 1) return 'pokus'
  if (attempts >= 2 && attempts <= 4) return 'pokusy'
  return 'pokusů'
}

const StatToken = ({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className: string
}) => (
  <span
    className={cn(
      'inline-flex w-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none sm:px-2.5 sm:py-1',
      className,
    )}
  >
    <span className='font-semibold text-foreground'>{value}</span>
    {label && <span className='text-muted-foreground'>{label}</span>}
  </span>
)

const CompletionToken = ({
  completed,
  notStarted,
  completedQuizzes,
  totalQuizzes,
}: {
  completed: boolean
  notStarted: boolean
  completedQuizzes: number
  totalQuizzes: number
}) => (
  <span
    className={cn(
      'inline-flex w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-none sm:py-1.5 sm:text-xs md:text-xs',
      completed
        ? 'bg-secondary/30 text-[#2D8B6B]'
        : notStarted
          ? 'bg-destructive/15 text-destructive'
          : 'bg-accent-teal/20 text-[#288080]',
    )}
  >
    {completed ? (
      <CheckCircle2 className='hidden size-3.5 shrink-0 sm:inline-block' />
    ) : notStarted ? (
      <CircleX className='hidden size-3.5 shrink-0 sm:inline-block' />
    ) : (
      <Clock3 className='hidden size-3.5 shrink-0 sm:inline-block' />
    )}
    <span className='font-semibold text-current'>
      {completedQuizzes}/{totalQuizzes}
    </span>
  </span>
)

const LeaderboardName = ({
  username,
  className,
}: {
  username: string
  className?: string
}) => {
  const textRef = useRef<HTMLSpanElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const measure = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth + 1)
    }

    measure()

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measure())
        : null

    if (observer) {
      observer.observe(element)
    } else {
      window.addEventListener('resize', measure)
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [username])

  return (
    <span className={cn('group/name relative min-w-0', className)}>
      <span ref={textRef} className='block min-w-0 truncate'>
        {username}
      </span>
      {isTruncated && (
        <span className='pointer-events-none absolute left-0 top-full z-20 mt-1 hidden max-w-[16rem] rounded-md bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-lg ring-1 ring-border/70 group-hover/name:block'>
          {username}
        </span>
      )}
    </span>
  )
}

const RowContent = ({
  entry,
  emphasize = false,
  showLeaderTrophy = false,
}: {
  entry: LeaderboardEntry
  emphasize?: boolean
  showLeaderTrophy?: boolean
}) => {
  const rankStyle = getRankStyle(entry.rank)
  const successRate = entry.successRate == null ? '—' : `${entry.successRate}%`
  const isCompleted = entry.status === 'completed'
  const isNotStarted = entry.completedQuizzes === 0

  return (
    <div className='flex items-center gap-3 md:gap-4'>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full text-xs font-bold sm:text-sm',
          rankStyle.circle,
        )}
      >
        {entry.rank}
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-row items-center justify-between gap-2 md:gap-3'>
          <p
            className={cn(
              'flex min-w-0 items-center gap-1.5 text-sm font-semibold md:text-base',
              emphasize ? rankStyle.accent : 'text-neutral-black',
              emphasize && 'font-bold',
            )}
          >
            <LeaderboardName username={entry.username} className='flex-1' />
            {showLeaderTrophy && entry.rank === 1 && (
              <Trophy className={cn('size-4 shrink-0', rankStyle.accent)} />
            )}
          </p>

          <div className='grid shrink-0 grid-cols-[2.5rem_2.75rem_3rem] items-center gap-x-1 text-center sm:grid-cols-[3.5rem_3.75rem_3.8rem] sm:gap-x-2'>
            <div className='flex justify-center'>
              <Label size='md' className='text-center'>
                {successRate}
              </Label>
            </div>
            <CompletionToken
              completed={isCompleted}
              notStarted={isNotStarted}
              completedQuizzes={entry.completedQuizzes}
              totalQuizzes={entry.totalQuizzes}
            />
            <StatToken
              label={formatAttemptsLabel(entry.submissionsCount)}
              value={`${entry.submissionsCount}`}
              className='bg-transparent text-foreground'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TopRankCard = ({
  entry,
  showLeaderTrophy = false,
}: {
  entry: LeaderboardEntry
  showLeaderTrophy?: boolean
}) => {
  const rankStyle = getRankStyle(entry.rank)

  return (
    <div className={cn('px-2 py-3 transition-colors sm:px-4', rankStyle.card)}>
      <RowContent entry={entry} emphasize showLeaderTrophy={showLeaderTrophy} />
    </div>
  )
}

const RestRankRow = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className='px-2 py-2 transition-colors hover:bg-background/35 sm:px-4 sm:py-2.5 md:px-4'>
    <RowContent entry={entry} />
  </div>
)

const CourseLeaderboard = ({
  leaderboard,
  emptyMessage = 'Zatím žádná studentská odevzdání.',
  showLeaderTrophy = false,
}: CourseLeaderboardProps) => {
  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleEntries = isExpanded ? leaderboard : topThree

  return (
    <section className='space-y-2 rounded-2xl border border-border/70 bg-background p-3 shadow-sm sm:p-4'>
      {leaderboard.length === 0 ? (
        <div className='overflow-hidden rounded-2xl bg-background'>
          <StateComp
            img={feedImg}
            iconClassName='h-12 w-12 md:h-13 md:w-13'
            type='no-content'
            message={emptyMessage}
            className='pb-6 pt-8'
          />
        </div>
      ) : (
        <div className='overflow-hidden rounded-2xl bg-sky-50/55'>
          <div className='divide-y divide-border/55'>
            {visibleEntries.map((entry, index) =>
              index < 3 ? (
                <TopRankCard
                  key={entry.userId}
                  entry={entry}
                  showLeaderTrophy={showLeaderTrophy}
                />
              ) : (
                <RestRankRow key={entry.userId} entry={entry} />
              ),
            )}
          </div>

          {rest.length > 0 && (
            <button
              type='button'
              className={cn(
                'px-3 py-2 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline md:px-4',
                isExpanded && 'pt-2.5',
              )}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? 'Zobrazit méně' : `Zobrazit další (${rest.length})`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default CourseLeaderboard
