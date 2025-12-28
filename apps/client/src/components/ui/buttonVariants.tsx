import {cva} from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all gap-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "rounded-xl cursor-pointer bg-linear-to-r from-accent-teal to-primary text-background\
          font-bold hover:from-accent-teal-dark hover:to-accent-blue transition-all duration-300 \
          shadow-lg hover:shadow-xl hover:scale-102 text-base max-sm:text-md sm:text-md \
          disabled:pointer-events-none disabled:opacity-60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-background cursor-pointer shadow-md text-accent-blue transition-colors \
          duration-200 rounded-lg px-4 py-2 hover:bg-secondary \
        font-semibold",
        filter: "px-4 py-1.5 rounded-xl max-sm:text-xs text-sm font-medium \
        transition-all duration-300 flex items-center gap-2 cursor-pointer",
        grid:
        "flex items-center rounded-xl font-bold text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer",
        ghost:
        "hover:text-primary active-text-primary cursor-pointer text-gray-400 transition-colors",
        link: "text-primary underline-offset-4 hover:underline font-semibold cursor-pointer",
      },
      size: {
        primary: "px-7 py-3.5 max-sm:py-2", 
        default: "",
        grid: "px-6 py-2.5",
        md: "px-5 py-2 gap-2",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-7 has-[>svg]:px-4 py-3.5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export default buttonVariants;