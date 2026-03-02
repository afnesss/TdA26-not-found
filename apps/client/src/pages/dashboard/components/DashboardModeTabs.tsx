import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DashboardModeTab<T extends string> = {
  value: T
  label: string
  disabled?: boolean
}

interface DashboardModeTabsProps<T extends string> {
  value: T
  tabs: DashboardModeTab<T>[]
  onChange: (value: T) => void
  className?: string
}

const DashboardModeTabs = <T extends string>({
  value,
  tabs,
  onChange,
  className,
}: DashboardModeTabsProps<T>) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value
        return (
          <Button
            key={tab.value}
            variant='filter'
            size='sm'
            className={cn(
              'whitespace-nowrap rounded-xl',
              isActive
                ? 'bg-primary text-background shadow-md'
                : 'bg-background text-primary hover:bg-gray-50 border border-gray-200',
              tab.disabled &&
                'opacity-50 cursor-not-allowed hover:bg-background',
            )}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </Button>
        )
      })}
    </div>
  )
}

export default DashboardModeTabs
