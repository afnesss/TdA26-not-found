import { Label } from '@/components/ui/label'
import type { ReactNode } from 'react'

type LegalSectionProps = {
  title: string
  children: ReactNode
}

const LegalSection = ({ title, children }: LegalSectionProps) => {
  return (
    <section className='space-y-3'>
      <Label variant='name' className='text-xl sm:text-2xl'>
        {title}
      </Label>
      {children}
    </section>
  )
}

type LegalTextProps = {
  children: ReactNode
  className?: string
}

export const LegalText = ({ children, className = '' }: LegalTextProps) => {
  return (
    <Label
      variant='descriptionSmall'
      size='md'
      className={`leading-relaxed ${className}`}
    >
      {children}
    </Label>
  )
}

export default LegalSection
