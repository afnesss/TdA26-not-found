import { CheckCircle2, Copy, Download, ExternalLink } from 'lucide-react'
import AnalyticsAttentionAlert from '@/pages/dashboard/components/AnalyticsAttentionAlert'
import DonutOverviewSection from './DonutOverviewSection'

const getCzechNoun = (
  count: number,
  one: string,
  few: string,
  many: string,
) => {
  const abs = Math.abs(count)
  const lastTwo = abs % 100
  if (lastTwo >= 11 && lastTwo <= 14) return many
  const last = abs % 10
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

interface AnalyticsSectionProps {
  score: number | null
  completions: number
  modules: number
  activeModules: number
  materials: number
  quizzes: number
  materialDownloads: number
  materialCopies: number
  materialOpens: number
  attention: string[]
  isLoading?: boolean
  isError?: boolean
}

const AnalyticsSection = ({
  score,
  completions,
  modules,
  activeModules,
  materials,
  quizzes,
  materialDownloads,
  materialCopies,
  materialOpens,
  attention,
  isLoading,
  isError,
}: AnalyticsSectionProps) => {
  const pct = Math.min(100, Math.max(0, score ?? 0))
  const formatted =
    score == null
      ? '—'
      : `${Number.isInteger(score) ? score : score.toFixed(1)}%`
  const hasQuizAttempts = completions > 0
  const hasAttention = attention.length > 0

  return (
    <div className='w-full space-y-2'>
      <div className='flex items-stretch gap-2'>
        <div style={{ flex: '0 0 40%' }}>
          {hasQuizAttempts ? (
            <DonutOverviewSection
              percent={pct}
              centerValue={formatted}
              footerLabel='Průměrné skóre'
              footerSubLabel={`${completions} odeslání`}
              className='w-full px-1 py-2'
            />
          ) : (
            <div className='flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/40 px-2.5 py-3 text-center'>
              <div>
                <p className='text-xs font-semibold text-muted-foreground md:text-sm'>
                  Žádná odeslání kvízů
                </p>
                <p className='mt-0.5 text-[10px] text-muted-foreground/80 md:text-xs'>
                  Průměrné skóre se zobrazí po prvních pokusech.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-1.5' style={{ flex: '1 1 0' }}>
          <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1 min-h-12'>
            <span className='text-xs md:text-sm text-muted-foreground'>
              Moduly:{' '}
              <span className='text-sm font-semibold leading-none text-foreground'>
                {modules}
              </span>
            </span>
            <span className='text-[10px] md:text-xs text-muted-foreground/80'>
              {activeModules}{' '}
              {getCzechNoun(
                activeModules,
                'aktivní modul',
                'aktivní moduly',
                'aktivních modulů',
              )}
            </span>
          </div>

          <div className='grid grid-cols-2 gap-1.5' style={{ flex: 1 }}>
            <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1 min-h-12'>
              <span className='text-xs md:text-sm text-muted-foreground'>
                Materiály:{' '}
                <span className='text-sm  font-semibold leading-none text-foreground'>
                  {materials}
                </span>
              </span>
              <div className='mt-0.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] md:text-[10px]'>
                <span className='inline-flex items-center gap-0.5 text-muted-foreground'>
                  <Download className='h-3 w-3' />
                  <span className='font-semibold text-primary'>
                    {materialDownloads}
                  </span>
                </span>
                <span className='inline-flex items-center gap-0.5 text-muted-foreground'>
                  <ExternalLink className='h-3 w-3' />
                  <span className='font-semibold text-primary'>
                    {materialOpens}
                  </span>
                </span>
                <span className='inline-flex items-center gap-0.5 text-muted-foreground'>
                  <Copy className='h-3 w-3' />
                  <span className='font-semibold text-primary'>
                    {materialCopies}
                  </span>
                </span>
              </div>
            </div>

            <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1 min-h-12'>
              <span className='text-xs md:text-sm text-muted-foreground'>
                Kvízy:{' '}
                <span className='text-sm  font-semibold leading-none text-foreground'>
                  {quizzes}
                </span>
              </span>
            </div>
          </div>

          {hasAttention ? (
            <AnalyticsAttentionAlert messages={attention} className='mt-0' />
          ) : (
            <div className='rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-1.5 bg-secondary/10 text-accent-teal-light'>
              <CheckCircle2 className='w-3.5 h-3.5 shrink-0 text-accent-teal-light' />
              <span className='font-medium'>Bez kritických signálů</span>
            </div>
          )}
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
