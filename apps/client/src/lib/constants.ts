import { BookOpen, Calendar, ArrowRight } from 'lucide-react'
import type { CourseStatus } from './schemas'

export const colors = [
  'accent-teal-light',
  'accent-teal',
  'accent-teal-dark',
  'gray',
] as const
export type ColorVariant = (typeof colors)[number]

export const colorStyles = {
  bg: {
    secondary: 'from-secondary/40 to-secondary/66',
    primary: 'from-primary/25 to-primary/45',
    gray: 'from-gray-200/70 to-gray-300/90',
    'accent-teal-light': 'from-accent-teal-light/20 to-accent-teal-light/60',
    'accent-teal-light-subtle':
      'from-accent-teal-light/15 to-accent-teal-light/40',
    'accent-teal': 'from-accent-teal/30 to-accent-teal/60',
    'accent-teal-dark': 'from-accent-teal-dark/20 to-accent-teal-dark/60',
  },
  text: {
    secondary: 'text-[#45ad63]',
    primary: 'text-accent-blue',
    gray: 'text-gray-700',
    'accent-teal-light': 'text-[#2D8B6B]',
    'accent-teal-light-subtle': 'text-[#2D8B6B]',
    'accent-teal': 'text-[#246969]',
    'accent-teal-dark': 'text-[#166289]',
  },
  gradient: {
    'accent-teal-light':
      'from-secondary via-accent-teal-light to-accent-teal-light',
    'accent-teal': 'from-accent-teal-light via-accent-teal to-accent-teal',
    'accent-teal-dark': 'from-accent-teal via-accent-teal-dark to-primary',
    primary: 'from-accent-teal via-accent-teal-dark to-primary',
    gray: 'from-gray-200 via-gray-300 to-gray-300',
  },
  line: {
    secondary: 'bg-secondary/80',
    primary: 'bg-primary/45',
    gray: 'bg-gray-300',
    'accent-teal-light': 'bg-accent-teal-light/50',
    'accent-teal-light-subtle': 'bg-accent-teal-light/40',
    'accent-teal': 'bg-accent-teal/80',
    'accent-teal-dark': 'bg-accent-teal-dark/45',
  },
}

export const headerLineHeight = 'h-1.5'

export const filters = [
  { id: 'newest', label: 'Nejnovější' },
  { id: 'oldest', label: 'Nejstarší' },
  { id: 'updated', label: 'Upravené' },
] as const

export type FilterIds = (typeof filters)[number]['id']

export const filterItems: { label: string; value: FilterIds }[] = [
  { label: 'Nejnovější', value: 'newest' },
  { label: 'Nejstarší', value: 'oldest' },
]

export const statusFilterItems: { label: string; value: CourseStatus }[] = [
  { label: 'Návrhy', value: 'draft' },
  { label: 'Naplánované', value: 'planned' },
  { label: 'Aktivní', value: 'live' },
  { label: 'Pozastavené', value: 'paused' },
  { label: 'Archiv', value: 'archived' },
]

export const defaultStatusFilters: Record<CourseStatus, boolean> = {
  draft: true,
  planned: true,
  live: true,
  paused: true,
  archived: true,
}
