import Breadcrumb from '@/components/shared/Breadcrumb'
import { Label } from '@/components/ui/label'
import iconIdea from '@/assets/t-idea-blue.svg'
import { cn } from '@/lib/utils'

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
}: SummarySectionProps) => {
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
            <p className='text-gray-600 text-sm md:text-base leading-relaxed '>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default SummarySection
