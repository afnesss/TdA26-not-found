import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import type { LucideIcon } from 'lucide-react'

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

      <div className='flex flex-row justify-between items-center gap-3 p-3 sm:p-4 lg:p-5'>
        <Label variant='title' size='lg'>
          {title}
        </Label>

        <Button variant='primary' size='primary' onClick={onButtonClick}>
          {Icon && <Icon className='w-5 h-5' />}
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

export default DetailHeader
