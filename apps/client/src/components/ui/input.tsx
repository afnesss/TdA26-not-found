import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva('w-full rounded-xl', {
  variants: {
    variant: {
      default:
        'px-4 py-2 text-foreground text-sm md:text-base bg-background/90 border-2\
          border-gray-200 shadow-sm outline-none transition-all duration-300 hover:shadow-md focus:shadow-lg \
          focus:border-accent-teal-light focus:ring-2 focus:ring-accent-teal/20 placeholder:text-muted-foreground \
          selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed\
            disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
      ghost: 'focus:outline-none focus:ring-0 focus:bg-gray-100 py-2 px-4',
    },
  },
})

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
