import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

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

const lastToggleValueByKey = new Map<string, string>()

// Separate component so hooks are always called unconditionally
const ToggleSwitch = <T extends string>({
  value,
  tabs,
  onChange,
  className,
}: DashboardModeTabsProps<T>) => {
  const [primaryTab, secondaryTab] = tabs
  const isSecondaryActive = value === secondaryTab.value
  const targetTab = isSecondaryActive ? primaryTab : secondaryTab
  const isDisabled = Boolean(targetTab.disabled)

  const tabsKey = useMemo(
    () => `switch:${tabs.map((tab) => tab.value).join('|')}`,
    [tabs],
  )

  const [animatedValue, setAnimatedValue] = useState<T>(() => {
    const lastValue = lastToggleValueByKey.get(tabsKey)
    return (lastValue ?? value) as T
  })

  useEffect(() => {
    if (animatedValue === value) return
    const frame = requestAnimationFrame(() => setAnimatedValue(value))
    return () => cancelAnimationFrame(frame)
  }, [animatedValue, value])

  useEffect(() => {
    lastToggleValueByKey.set(tabsKey, value)
  }, [tabsKey, value])

  const isAnimatedSecondaryActive = animatedValue === secondaryTab.value

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <span className='text-[10px] md:text-xs font-semibold tracking-wide text-primary'>
        Statistics
      </span>
      <button
        type='button'
        role='switch'
        aria-checked={isSecondaryActive}
        aria-label='Toggle statistics mode'
        disabled={isDisabled}
        className={cn(
          'relative inline-flex h-3 md:h-4 w-8 md:w-10 items-center rounded-full border transition-all duration-200 mr-0.5',
          isSecondaryActive
            ? 'bg-primary border-primary'
            : 'bg-primary/15 border-primary/30',
          isDisabled && 'opacity-50 cursor-not-allowed',
        )}
        onClick={() => {
          if (targetTab.disabled) return
          onChange(targetTab.value)
        }}
      >
        <span
          className={cn(
            'pointer-events-none absolute -top-0.5 left-0 h-4 md:h-5 w-4 md:w-5 rounded-full bg-background shadow-lg transition-all duration-200',
            isAnimatedSecondaryActive ? 'translate-x-5' : '-translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

const DashboardModeTabs = <T extends string>({
  value,
  tabs,
  onChange,
  className,
}: DashboardModeTabsProps<T>) => {
  if (tabs.length === 0) return null

  if (tabs.length === 2) {
    return (
      <ToggleSwitch
        value={value}
        tabs={tabs}
        onChange={onChange}
        className={className}
      />
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
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
