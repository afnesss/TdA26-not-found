'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  variant?: 'checkbox' | 'radio'
}

function Checkbox({
  className,
  variant = 'checkbox',
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer shrink-0 border-2 border-gray-300 cursor-pointer transition-all outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
        variant === 'checkbox' ? 'rounded-sm' : 'rounded-full',
        'size-4 md:size-5',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current'
      >
        {variant === 'checkbox' ? (
          <CheckIcon className='size-3 md:size-3.5' strokeWidth={3} />
        ) : (
          <div className='size-2 rounded-full bg-current' />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
