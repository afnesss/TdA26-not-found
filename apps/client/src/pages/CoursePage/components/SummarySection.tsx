import Breadcrumb from '@/components/shared/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import iconIdea from '@/assets/t-idea-blue.svg'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type SummaryBreadcrumbItem = {
  label: string
  path?: string
}

interface SummarySectionProps {
  name?: string
  description?: string
  breadcrumbs?: SummaryBreadcrumbItem[]
  className?: string
  cardClassName?: string
  rightSlot?: ReactNode
  collapsedLines?: number
}

const SummarySection = ({
  name,
  description,
  breadcrumbs,
  className,
  cardClassName,
  rightSlot,
  collapsedLines = 2,
}: SummarySectionProps) => {
  const { t } = useTranslation(['courses', 'common'])
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  const resolvedBreadcrumbs =
    breadcrumbs ??
    ([
      { label: t('userCourse.breadcrumbRoot', { ns: 'courses' }), path: '/courses' },
      { label: t('userCourse.breadcrumbCurrent', { ns: 'courses' }) },
    ] satisfies SummaryBreadcrumbItem[])

  useEffect(() => {
    if (isExpanded || !description) return

    const element = descriptionRef.current
    if (!element) return

    const measure = () => {
      const isOverflowing = element.scrollHeight > element.clientHeight + 1
      setCanExpand(isOverflowing)
    }

    measure()

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measure())
        : null

    if (observer) {
      observer.observe(element)
    } else {
      window.addEventListener('resize', measure)
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [description, isExpanded])

  return (
    <section className={cn(className)}>
      <div
        className={cn(
          'bg-background rounded-xl border border-gray-100 overflow-hidden relative',
          cardClassName,
        )}
      >
        <div className={cn(colorStyles.line['secondary'], headerLineHeight)} />

        <div className='p-4 lg:p-6 -mt-2 gap-1 sm:gap-2 flex flex-col'>
          <div className='flex gap-1 justify-between '>
            <div className='flex flex-col gap-1 sm:gap-2'>
              <Breadcrumb items={resolvedBreadcrumbs} />
              <Label className='mb-0 font-bold' size='lg'>
                {name}
              </Label>
            </div>
            {rightSlot ?? (
              <img
                src={iconIdea}
                className='w-8 h-8 md:w-9 md:h-9 opacity-90 shrink-0'
                alt=''
                aria-hidden='true'
              />
            )}
          </div>
          {description && (
            <div className='space-y-1'>
              <p
                ref={descriptionRef}
                className={cn(
                  'text-gray-600 text-sm md:text-base leading-relaxed',
                  !isExpanded && `line-clamp-${collapsedLines}`,
                )}
              >
                {description}
              </p>
              {canExpand && (
                <Button
                  variant='link'
                  size='default'
                  className='h-auto p-0'
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded
                    ? t('summary.showLess', { ns: 'common' })
                    : t('summary.showMore', { ns: 'common' })}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SummarySection
