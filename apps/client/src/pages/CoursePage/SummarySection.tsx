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

const SummarySection = ({name, description}: SummarySectionProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="bg-background rounded-xl border border-gray-100 overflow-hidden relative">
        <div className="bg-linear-to-r from-secondary to-accent-teal-light h-2" />


        <div className="px-5 md:px-6 py-5 gap-3 flex flex-col">
          <div className='flex md:flex-row gap-2 items-center'>
            <Button variant={'grid'}
           className={cn(
              'bg-linear-to-br px-3 py-1 h-8',
              colorStyles.bg['accent-teal-light'],
              colorStyles.text['accent-teal-light']
            )}
             onClick={() => navigate(-1)}>
              <ChevronLeft size={16}/>
                <span>Zpět</span>
            </Button>
            <Label className='mb-0' size="lg">{name}</Label>
           </div>
          {description && (
            <p className="text-gray-600 text-base leading-relaxed mb-2">
              {description}
            </p>
          )}
        
        </div>
      </div>
    </section>
  )
}

export default SummarySection
