import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnalyticsStatCardProps {
  label: string
  value: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}

const AnalyticsStatCard = ({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: AnalyticsStatCardProps) => {
  return (
    <div
      className={cn(
        'border',
        'rounded-md bg-muted/70 px-2 py-1 flex flex-col items-center min-w-10 border-transparent',
        className,
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold leading-none text-foreground',
          valueClassName,
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'text-[10px] md:text-xs  text-muted-foreground',
          labelClassName,
        )}
      >
        {label}
      </p>
    </div>
  )
}

export default AnalyticsStatCard
