// ─── Analytics section ────────────────────────────────────────────────────────

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import DonutChart from './DonutChart'

interface AnalyticsSectionProps {
  score: number | null
  completions: number
  modules: number
  materials: number
  quizzes: number
  attention: string[]
  isLoading?: boolean
  isError?: boolean
}

const AnalyticsSection = ({
  score,
  completions,
  modules,
  materials,
  quizzes,
  attention,
  isLoading,
  isError,
}: AnalyticsSectionProps) => {
  const pct = Math.min(100, Math.max(0, score ?? 0))
  const formatted =
    score == null
      ? '—'
      : `${Number.isInteger(score) ? score : score.toFixed(1)}%`
  const hasAttention = attention.length > 0

  return (
    <div className='w-full space-y-2'>
      {/* Main row — items-stretch keeps both sides equal height */}
      <div className='flex items-stretch gap-2'>
        {/* LEFT 1/3 — donut */}
        <div
          className='flex flex-col items-center justify-center gap-1 rounded-xl bg-accent-teal-dark/10 '
          style={{ flex: '0 0 40%', padding: '10px 6px' }}
        >
          <div className='relative' style={{ width: 76, height: 76 }}>
            <DonutChart percent={pct} size={78} stroke={8} />
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-0.5'>
              <span className='text-sm font-bold leading-none text-accent-teal-dark'>
                {formatted}
              </span>
              <span className='text-wrap text-[10px] md:text-xs font-medium leading-none text-muted-foreground'>
                {completions} odeslání
              </span>
            </div>
          </div>
          <span
            className='text-xs text-muted-foreground text-center leading-tight'
            style={{ maxWidth: 80 }}
          >
            Průměrné skóre kvízů
          </span>
        </div>

        {/* RIGHT 2/3 — stats */}
        <div className='flex flex-col gap-1.5' style={{ flex: '1 1 0' }}>
          {/* Modules — full width */}
          <div className='rounded-lg flex  flex-col items-center justify-center bg-muted  py-1.5 px-1'>
            <span className='text-base font-semibold leading-none text-foreground'>
              {modules}
            </span>
            <span className='text-xs md:text-sm mt-0.5 text-muted-foreground'>
              Moduly
            </span>
          </div>

          {/* Materials + Quizzes */}
          <div className='grid grid-cols-2 gap-1.5' style={{ flex: 1 }}>
            {[
              { label: 'Materiály', value: materials },
              { label: 'Kvízy', value: quizzes },
            ].map(({ label, value }) => (
              <div
                key={label}
                className='rounded-lg flex  flex-col items-center justify-center bg-muted  py-1.5 px-1'
              >
                <span className='text-sm md:text-base font-semibold leading-none text-foreground'>
                  {value}
                </span>
                <span className='text-xs md:text-sm mt-0.5 text-muted-foreground'>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-1.5',
              hasAttention
                ? 'bg-destructive/10 text-destructive'
                : 'bg-secondary/10 text-accent-teal-light',
            )}
          >
            {hasAttention ? (
              <AlertCircle className='w-3.5 h-3.5 shrink-0' />
            ) : (
              <CheckCircle2 className='w-3.5 h-3.5 shrink-0 text-accent-teal-light' />
            )}
            <span className='font-medium '>
              {hasAttention ? attention.join(', ') : 'Bez kritických signálů'}
            </span>
          </div>
        </div>
      </div>

      {isLoading && <p className='text-xs text-muted-foreground'>Načítání…</p>}
      {isError && (
        <p className='text-xs text-destructive'>
          Přehled se nepodařilo načíst.
        </p>
      )}
    </div>
  )
}

export default AnalyticsSection
