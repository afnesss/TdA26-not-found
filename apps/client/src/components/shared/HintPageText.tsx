import { cn } from '@/lib/utils'

type HintPageTextProps = {
  text: string
  icon?: React.ElementType
  spanText?: string | null
  className?: string
}

const HintPageText = ({
  text,
  icon: Icon,
  spanText = null,
  className,
}: HintPageTextProps) => {
  return (
    <div className='flex items-center gap-4'>
      <span
        className={cn(
          'bg-linear-to-r from-secondary/40 to-accent-teal-light/30 ' +
            'text-primary px-2 sm:px-3 py-1.5 sm:py-2 rounded-full max-sm:text-xs sm:text-sm text-md font-bold ' +
            'inline-flex items-center gap-2 border-2 border-secondary/50 shadow-sm',
          className,
        )}
      >
        {Icon && <Icon className='w-4 h-4 shrink-0 ' />}
        {text}
        {spanText && (
          <span className='bg-primary text-background px-2 py-0.5 rounded-full max-sm:text-2xs sm:text-2xs text-xs'>
            {spanText}
          </span>
        )}
      </span>
    </div>
  )
}

export default HintPageText
