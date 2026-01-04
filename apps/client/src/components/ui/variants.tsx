import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all gap-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary:
          'rounded-xl cursor-pointer bg-linear-to-r from-accent-teal to-primary text-background\
          font-bold hover:from-accent-teal-dark hover:to-accent-blue transition-all duration-300 \
          shadow-lg hover:shadow-xl hover:scale-102 text-base max-sm:text-md sm:text-md \
          disabled:pointer-events-none disabled:opacity-60',
        outline:
          'border bg-background rounded-xl shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-background cursor-pointer shadow-md text-accent-blue transition-colors \
          duration-200 rounded-xl px-4 py-2 hover:bg-secondary \
        font-semibold',
        filter:
          'px-4 py-1.5 h-8 rounded-xl max-sm:text-xs text-sm font-medium \
        transition-all duration-300 flex items-center gap-2 cursor-pointer',
        grid: 'flex items-center rounded-xl font-bold text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
        ghost:
          'hover:text-primary active-text-primary cursor-pointer text-gray-400 transition-colors',
        tab: 'text-xs md:text-base text-background hover:text-secondary active:text-secondary font-semibold cursor-pointer',
        link: 'text-primary underline-offset-4 hover:underline font-semibold cursor-pointer',
      },
      size: {
        primary: 'px-5 lg:px-7 py-2 md:py-3.5',
        default: '',
        grid: 'px-3 md:px-6 py-2 md:py-2.5',
        md: 'px-5 py-2 gap-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-7 has-[>svg]:px-4 py-3.5',
        icon: 'size-8',
        'icon-sm': 'size-7',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export default buttonVariants

export const inputVariants = cva('w-full rounded-xl', {
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
