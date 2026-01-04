import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { inputVariants } from './variants'

interface InputProps
  extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, variant = 'default', ...props },
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        data-variant={variant}
        data-slot='input'
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

export { Input }
