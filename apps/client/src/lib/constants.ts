import { BookOpen, Calendar, ArrowRight } from 'lucide-react'

export const colors = [
  'accent-teal-light',
  'accent-teal',
  'accent-teal-dark',
] as const
export type ColorVariant = (typeof colors)[number]

export const colorStyles = {
  bg: {
    secondary: 'from-secondary/20 to-secondary/60',
    'accent-teal-light': 'from-accent-teal-light/20 to-accent-teal-light/60',
    'accent-teal': 'from-accent-teal/20 to-accent-teal/60',
    'accent-teal-dark': 'from-accent-teal-dark/20 to-accent-teal-dark/60',
  },
  text: {
    secondary: 'text-[#45ad63]',
    'accent-teal-light': 'text-[#2D8B6B]',
    'accent-teal': 'text-[#246969]',
    'accent-teal-dark': 'text-[#166289]',
  },
  gradient: {
    'accent-teal-light':
      'from-secondary via-accent-teal-light to-accent-teal-light',
    'accent-teal': 'from-accent-teal-light via-accent-teal to-accent-teal',
    'accent-teal-dark': 'from-accent-teal via-accent-teal-dark to-primary',
  },
  iconBg: {
    secondary: 'bg-secondary/20',
    'accent-teal-light': 'bg-accent-teal-light/20',
    'accent-teal': 'bg-accent-teal/20',
    'accent-teal-dark': 'bg-accent-teal-dark/20',
  },
  expandedBg: {
    'accent-teal-light': 'bg-accent-teal-light/5',
    'accent-teal': 'bg-accent-teal/5',
    'accent-teal-dark': 'bg-accent-teal-dark/5',
  },
  questionBorder: {
    'accent-teal-light': 'border-accent-teal-light/20',
    'accent-teal': 'border-accent-teal/20',
    'accent-teal-dark': 'border-accent-teal-dark/20',
  },
}

export const filters = [
  { id: 'all', label: 'Všechny' },
  { id: 'newest', label: 'Nejnovější' },
  { id: 'updated', label: 'Upravené' },
] as const

export type FilterIds = (typeof filters)[number]['id']
