import Breadcrumb from '@/components/shared/Breadcrumb'
import { Label } from '@/components/ui/label'
import iconIdea from '@/assets/t-idea-blue.svg'

interface SummarySectionProps {
  name?: string
  description?: string
}

const SummarySection = ({ name, description }: SummarySectionProps) => {
  return (
    <section className='mb-5 md:mb-7'>
      <div className='bg-background rounded-xl border border-gray-100 overflow-hidden relative'>
        <div className='bg-linear-to-r from-secondary to-accent-teal-light h-2' />

        <div className='px-3 md:px-6 py-4 gap-1 sm:gap-2 flex flex-col'>
          <div className='flex justify-between '>
            <div className='flex flex-col gap-1 sm:gap-2'>
              <Breadcrumb
                items={[
                  { label: 'Kurzy', path: '/courses' },
                  { label: 'Detaily kurzu' },
                ]}
              />
              <Label className='mb-0' size='xl'>
                {name}
              </Label>
            </div>
            <img src={iconIdea} className='w-13 h-13 md:w-15 md:h-15 '></img>
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
