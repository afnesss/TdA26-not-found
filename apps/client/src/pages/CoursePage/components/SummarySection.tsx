import React from 'react'
import { colorStyles } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'

interface SummarySectionProps {
  name?: string
  description?: string
}

const SummarySection = ({ name, description }: SummarySectionProps) => {
  const navigate = useNavigate()

  return (
    <section className='mb-5 md:mb-7'>
      <div className='bg-background rounded-xl border border-gray-100 overflow-hidden relative'>
        <div className='bg-linear-to-r from-secondary to-accent-teal-light h-2' />

        <div className='px-3 md:px-5 py-5 gap-3 flex flex-col'>
          <div className='flex flex-col md:flex-row gap-3 items-start md:items-center'>
            <Button
              variant={'grid'}
              className={cn(
                'bg-linear-to-br px-3 py-1 h-8',
                colorStyles.bg['accent-teal-light'],
                colorStyles.text['accent-teal-light'],
              )}
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
              <span>Zpět</span>
            </Button>
            <Label className='mb-0' size='xl'>
              {name}
            </Label>
          </div>
          {description && (
            <p className='text-gray-600 text-sm md:text-base leading-relaxed mb-2'>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default SummarySection
