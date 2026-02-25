import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { ComponentProps } from 'react'

type DashboardAddButtonProps = {
  label: string
  className?: string
} & Pick<ComponentProps<typeof Button>, 'onClick' | 'disabled'>

const DashboardAddButton = ({
  label,
  className,
  onClick,
  disabled,
}: DashboardAddButtonProps) => {
  return (
    <Button
      variant='outline'
      size='sm'
      className={cn('h-8 border-dashed rounded-xl', className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <Plus className='size-4' />
      <span className='hidden md:inline'>{label}</span>
    </Button>
  )
}

export default DashboardAddButton
