import React from 'react'
import { colorStyles } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import Breadcrumb from '@/components/shared/Breadcrumb'

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
          <Breadcrumb
            items={[
              { label: 'Kurzy', path: '/courses' },
              { label: 'Detaily kurzu' },
            ]}
          />
          <div className='flex flex-col md:flex-row gap-3 items-start md:items-center'>
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
