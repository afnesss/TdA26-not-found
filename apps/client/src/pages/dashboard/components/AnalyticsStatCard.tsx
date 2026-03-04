import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnalyticsStatCardProps {
  label: ReactNode
  value: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
  inline?: boolean
}

const AnalyticsStatCard = ({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  inline = false,
}: AnalyticsStatCardProps) => {
  return (
    <div
      className={cn(
        'border',
        inline
          ? 'rounded-md bg-muted/70 px-2 py-1 flex items-center gap-1 min-w-10 border-transparent'
          : 'rounded-md bg-muted/70 px-2 py-1 flex flex-col items-center min-w-10 border-transparent',
        className,
      )}
    >
      {inline ? (
        <>
          <p
            className={cn(
              'text-[10px] md:text-xs text-muted-foreground flex items-center gap-1',
              labelClassName,
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-xs font-semibold leading-none text-foreground',
              valueClassName,
            )}
          >
            {value}
          </p>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default AnalyticsStatCard
