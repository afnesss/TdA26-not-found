import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all gap-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.95]',
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
          'text-xs sm:text-sm border bg-background rounded-xl shadow-xs hover:bg-accent hover:text-accent-foreground \
          dark:bg-input/30 dark:border-input dark:hover:bg-input/50 cursor-pointer',
        secondary:
          'bg-background cursor-pointer shadow-md text-accent-blue transition-colors \
          duration-200 rounded-xl px-4 py-2 hover:bg-secondary active:bg-secondary \
        font-semibold',
        filter:
          'px-2 md:px-4 py-1 sm:py-1.5 h-8 rounded-xl max-sm:text-xs text-sm font-medium \
        transition-all duration-300 flex items-center gap-2 cursor-pointer',
        grid: 'flex items-center rounded-xl font-bold text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
        ghost:
          'hover:text-primary active-text-primary cursor-pointer text-gray-400 transition-colors',
        tab: 'text-sm md:text-base text-background hover:text-secondary active:text-secondary font-semibold cursor-pointer',
        link: 'text-[11px] sm:text-xs md:text-sm text-accent-blue underline-offset-2 hover:underline font-semibold cursor-pointer',
      },
      size: {
        primary: 'px-5 lg:px-7 py-2 md:py-2.5 lg:py-3.5',
        default: '',
        grid: 'px-3 md:px-6 py-2 md:py-2.5',
        md: 'px-5 py-2 gap-2',
        sm: ' rounded-md gap-1.5 py-1 md:py-1.5 px-3 has-[>svg]:px-2.5',
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
        'px-2.5 sm:px-4 py-1.5 sm:py-2 text-foreground text-sm md:text-base bg-background/90 border-1\
          border-gray-200  outline-none transition-all duration-300 \
          focus:border-accent-teal-light focus:ring-2 focus:ring-accent-teal/20 placeholder:text-muted-foreground \
          selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed\
            disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 placeholder:text-xs sm:placeholder:text-sm',
      ghost:
        'focus:outline-none focus:ring-0 bg-gray-100 py-1 md:py-1.5 px-2 md:px-4 border border-gray-200',
    },
  },
})

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground \
  disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary/20 data-[state=on]:text-accent-foreground\
   [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring \
   focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] aria-invalid:ring-destructive/20\
    dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap text-[10px] sm:text-xs cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-primary/20 hover:text-accent-foreground',
      },
      size: {
        default: 'py-1 px-2 min-w-9',
        sm: 'px-1.5 min-w-8',
        lg: 'py-2 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
