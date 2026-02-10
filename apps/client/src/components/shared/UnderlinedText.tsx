import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type UnderlinedTextProps = {
  children: ReactNode
  className?: string
  strokeWidth?: string
  height?: string
  offset?: string
}

const UnderlinedText = ({
  children,
  className = '',
  height = '12',
  offset = '-bottom-1.5',
  strokeWidth = '5',
}: UnderlinedTextProps) => {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        className={cn(`absolute left-0 w-full overflow-visible ${offset}`)}
        height={height}
        viewBox='0 0 400 12'
        preserveAspectRatio='none'
      >
        <path
          d='M0,10 Q50,3 110,9 Q150,14 200,4 Q250,2 300,11 Q350,15 400,6'
          stroke='#91F5AD'
          strokeWidth={strokeWidth}
          fill='none'
          strokeLinecap='round'
        />
      </svg>
    </span>
  )
}

export default UnderlinedText
