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
  icon?: string
}

const DetailHeader = ({
  icon,
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
          <div className='flex items-center gap-3'>
            <Label variant='title' size='lg'>
              {title}
            </Label>
            {icon && (
              <img
                src={icon}
                className='w-11 h-11 lg:w-13 lg:h-13 opacity-70'
              />
            )}
          </div>
        </div>
        <Button variant='primary' size='grid' onClick={onButtonClick} aria-label={buttonText}>
          {Icon ? (
            <Icon className='w-5 h-5 block md:hidden' aria-hidden='true' />
          ) : (
            <Plus className='w-5 h-5 block md:hidden' aria-hidden='true' />
          )}
          <span className={cn(`hidden md:block`)}>{buttonText}</span>
        </Button>
      </div>
    </div>
  )
}

export default DetailHeader
