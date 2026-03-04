import Breadcrumb from '@/components/shared/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import iconIdea from '@/assets/t-idea-blue.svg'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

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

  collapsedLines?: number
}

const defaultBreadcrumbs: SummaryBreadcrumbItem[] = [
  { label: 'Kurzy', path: '/courses' },
  { label: 'Detaily kurzu' },
]

const SummarySection = ({
  name,
  description,
  breadcrumbs = defaultBreadcrumbs,
  className,
  cardClassName,

  collapsedLines = 2,
}: SummarySectionProps) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

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
        <div className='bg-linear-to-r from-secondary to-accent-teal-light h-2' />

        <div className='px-3 md:px-6 py-4 gap-1 sm:gap-2 flex flex-col'>
          <div className='flex gap-1 justify-between '>
            <div className='flex flex-col gap-1 sm:gap-2'>
              <Breadcrumb items={breadcrumbs} />
              <Label className='mb-0 font-bold' size='lg'>
                {name}
              </Label>
            </div>
            <img src={iconIdea} className='w-11 h-11 md:w-12 md:h-13 '></img>
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
                  {isExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
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
