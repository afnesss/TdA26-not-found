import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'

type DropdownItem = {
  label: string
  value: string
  onClick: () => void
}

type DropdownMenuComponentProps = {
  trigger: ReactNode
  items: DropdownItem[]
  selectedValue?: string
  align?: 'start' | 'center' | 'end'
  width?: string
  sideOffset?: number
}

const DropdownMenuComponent = ({
  trigger,
  items,
  selectedValue,
  align = 'center',
  width = 'w-32',
  sideOffset = 5,
}: DropdownMenuComponentProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={sideOffset}
        align={align}
        className={cn(
          width,
          'bg-background rounded-xl shadow-lg border border-gray-200 p-1.5 sm:p-2 z-100',
        )}
      >
        <div className='space-y-0.5 sm:space-y-1'>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className={cn(
                'px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all',
                'hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium',
                selectedValue === item.value && 'bg-primary/5 text-primary',
              )}
              onClick={item.onClick}
            >
              <span className='flex-1'>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuComponent
