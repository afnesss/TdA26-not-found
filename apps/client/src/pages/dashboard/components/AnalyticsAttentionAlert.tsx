import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

type AnalyticsAttentionAlertProps = {
  message: string
  className?: string
}

const AnalyticsAttentionAlert = ({
  message,
  className,
}: AnalyticsAttentionAlertProps) => {
  return (
    <div
      className={cn(
        'mt-auto rounded-md px-2.5 py-1 text-[10px] flex items-center gap-1.5 bg-destructive/10 text-destructive w-full',
        className,
      )}
    >
      <AlertCircle className='w-3.5 h-3.5 shrink-0' />
      <span className='font-medium'>{message}</span>
    </div>
  )
}

export default AnalyticsAttentionAlert
