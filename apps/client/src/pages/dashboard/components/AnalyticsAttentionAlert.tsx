import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

type StatisticsAttentionAlertProps = {
  message?: string
  messages?: string[]
  className?: string
}

const StatisticsAttentionAlert = ({
  message,
  messages,
  className,
}: StatisticsAttentionAlertProps) => {
  const normalizedMessages = (
    messages?.length
      ? messages
      : (message ?? '')
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
  ).filter(Boolean)

  return (
    <div
      className={cn(
        'mt-auto rounded-md px-2.5 py-1 text-[10px] md:text-xs flex items-center gap-1.5 bg-destructive/10 text-destructive w-full',
        className,
      )}
    >
      <AlertCircle className='w-3.5 h-3.5 shrink-0' />
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        {normalizedMessages.map((item, index) => {
          const [labelPart, ...valueParts] = item.split(':')
          const hasValue = valueParts.length > 0
          const label = hasValue ? `${labelPart}:` : item
          const value = hasValue ? valueParts.join(':').trim() : ''

          return (
            <span key={`${item}-${index}`} className='inline-flex items-center'>
              <span>{label}</span>
              {hasValue && (
                <span className='ml-1 font-bold tabular-nums'>{value}</span>
              )}
              {index < normalizedMessages.length - 1 && (
                <span className='mx-2 text-destructive/60'>|</span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default StatisticsAttentionAlert
