import { cn } from '@/lib/utils'
import DonutChart from './DonutChart'

interface DonutOverviewSectionProps {
  percent: number
  centerValue: string
  centerSubValue?: string
  footerLabel: string
  footerSubLabel?: string
  className?: string
  size?: number
  stroke?: number
}

const DonutOverviewSection = ({
  percent,
  centerValue,
  centerSubValue,
  footerLabel,
  footerSubLabel,
  className,
  size = 72,
  stroke = 8,
}: DonutOverviewSectionProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-accent-teal-dark/10 px-4 py-3 h-full',
        className,
      )}
    >
      <div className='relative'>
        <DonutChart percent={percent} size={size} stroke={stroke} />
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-0.5'>
          <span className='text-sm font-bold leading-none text-accent-teal-dark'>
            {centerValue}
          </span>
          {centerSubValue && (
            <span className='text-[10px] font-medium leading-none text-muted-foreground md:text-xs'>
              {centerSubValue}
            </span>
          )}
        </div>
      </div>
      <div className='text-center'>
        <div className='text-xs leading-tight text-muted-foreground'>
          {footerLabel}
        </div>
        {footerSubLabel && (
          <div className='text-xs font-medium text-accent-teal-dark'>
            {footerSubLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default DonutOverviewSection
