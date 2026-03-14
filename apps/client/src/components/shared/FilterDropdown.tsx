import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'

type FilterDropdownItem<T extends string = string> = {
  label: string
  value: T
}

type StatusCheckboxItem<S extends string = string> = {
  label: string
  value: S
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

type FilterDropdownProps<T extends string = string> = {
  items: FilterDropdownItem<T>[]
  selectedValue?: T
  onSelect: (value: T) => void
  statusCheckboxes?: StatusCheckboxItem[]
  align?: 'start' | 'center' | 'end'
  width?: string
  triggerClassName?: string
  disabled?: boolean
}

const FilterDropdown = <T extends string = string>({
  items,
  selectedValue,
  onSelect,
  statusCheckboxes,
  align = 'center',
  width = 'w-28',
  triggerClassName = 'bg-background text-primary h-8.5 md:h-10 w-10 hover:bg-gray-50 border border-gray-200 shrink-0',
  disabled = false,
}: FilterDropdownProps<T>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='filter'
          className={triggerClassName}
          disabled={disabled || items.length === 0}
          aria-label='Filtrovat kurzy'
        >
          <Filter size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          sideOffset={5}
          align={align}
          className={cn(
            width,
            'bg-background rounded-xl shadow-lg border border-muted-foreground/20 p-1.5 sm:p-2 z-100',
          )}
        >
          {statusCheckboxes && statusCheckboxes.length > 0 && (
            <>
              <div className='space-y-0.5'>
                {statusCheckboxes.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    onSelect={(event) => event.preventDefault()}
                    onClick={() => item.onCheckedChange(!item.checked)}
                    className='px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium capitalize'
                  >
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) =>
                          item.onCheckedChange(Boolean(checked))
                        }
                        className='size-3.5 md:size-4'
                        aria-label={item.label}
                      />
                      <span>{item.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}
          <DropdownMenuSeparator className='my-1 h-px bg-gray-200' />
          <div className='space-y-0.5 sm:space-y-1'>
            {items.map((item) => (
              <DropdownMenuItem
                key={item.value}
                className={cn(
                  'px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all',
                  'hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium',
                  selectedValue === item.value && 'bg-primary/5 text-primary',
                )}
                onSelect={(event) => {
                  event.preventDefault()
                  onSelect(item.value)
                }}
              >
                <span className='flex-1'>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

export default FilterDropdown
