import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import { Plus, type LucideIcon } from 'lucide-react'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { cn } from '@/lib/utils'

type DetailHeaderProps = {
  title: string
  buttonText: string
  buttonIcon?: LucideIcon
  onButtonClick: () => void
  gradient?: 'accent-teal' | 'accent-teal-light' | 'accent-teal-dark'
}

const DetailHeader = ({
  title,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
  gradient = 'accent-teal',
}: DetailHeaderProps) => {
  return (
    <div className='bg-background rounded-xl shadow-sm overflow-hidden'>
      <div className={`h-2 bg-linear-to-r ${colorStyles.gradient[gradient]}`} />

      <div className='flex flex-row justify-between items-center gap-3 p-3 sm:p-4 lg:p-5 -mt-1'>
        <div className='flex flex-col gap-1'>
          <Breadcrumb
            items={[
              { label: 'Sprava kurzů', path: '/dashboard' },
              { label: 'Detaily kurzu' },
            ]}
          />
          <Label variant='title' size='lg'>
            {title}
          </Label>
        </div>
        <Button variant='primary' size='grid' onClick={onButtonClick}>
          {Icon ? (
            <Icon className='w-5 h-5 block md:hidden' />
          ) : (
            <Plus className='w-5 h-5 block md:hidden' />
          )}
          <span className={cn(`hidden md:block`)}>{buttonText}</span>
        </Button>
      </div>
    </div>
  )
}

export default DetailHeader
