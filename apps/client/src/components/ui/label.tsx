import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva('', { 
    variants: {
      variant: {
        default: "text-foreground text-left text-md",
        title:
          "max-sm:text-2xl text-3xl lg:text-4xl text-foreground font-bold text-left",
        description:
          "text-md md:text-lg text-foreground text-left max-w-full md:max-w-xl lg:max-w-2xl",
        name:
        "text-lg md:text-xl font-bold text-neutral-black group-hover:text-primary transition-colors duration-300 relative z-10 line-clamp-2 leading-snug flex-1 pr-2"
      },
      // size: {
      //   primary: "px-7 py-3.5 max-sm:py-2", 
      //   default: "h-9 px-4 py-2 has-[>svg]:px-3",
      //   sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      //   lg: "h-10 rounded-md px-7 has-[>svg]:px-4 py-3.5",
      //   icon: "size-9",
      //   "icon-sm": "size-8",
      //   "icon-lg": "size-10",
      // },
    },
    defaultVariants: {
      variant: "default",
      // size: "default",
    },
  
})

function Label({
  className,
  variant='default',
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-variant={variant}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
