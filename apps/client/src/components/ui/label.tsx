import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva('', { 
    variants: {
      variant: {
        default: "block text-foreground font-semibold ",
        title:
          " text-foreground font-bold text-left",
        description:
          "text-md md:text-lg text-foreground text-left max-w-full md:max-w-xl lg:max-w-2xl",
        name:
        "font-bold text-neutral-black group-hover:text-primary transition-colors duration-300 relative z-10 line-clamp-2 leading-snug flex-1 pr-2",
        formTitle:
        "relative bg-linear-to-r from-primary to-accent-blue text-xl font-semibold text-background flex items-center justify-center py-5",
        emptyState:
        'text-xl md:text-2xl font-bold text-neutral-black mb-7'
      },
      size: {
        primary: "max-sm:text-2xl text-3xl lg:text-4xl", 
        default: "text-lg md:text-xl",
        xl: "text-2xl md:text-3xl font-bold mb-5",
        lg: 'text-xl md:text-2xl',
        md: 'text-md',
        sm: 'text-sm'
      },
    },
    defaultVariants: {
      variant: "default",
       size: "default",
    },
  
})

function Label({
  className,
  variant='default',
  size = "default",
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-variant={variant}
      data-size={size}
      className={cn(
      "select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        labelVariants({ variant, size }),
        className
      )}
      {...props}
    />
  )
}

export { Label }
