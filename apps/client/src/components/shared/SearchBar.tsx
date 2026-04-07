import React, { type SetStateAction } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type SearchBarProps = {
  searchQuery: string
  setSearchQuery: (value: SetStateAction<string>) => void
  count?: string
  rightAdornment?: ReactNode
  className?: string
  placeholder?: string
}

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  count,
  rightAdornment,
  className,
  placeholder,
}: SearchBarProps) => {
  const { t } = useTranslation('common')
  const resolvedPlaceholder = placeholder ?? t('search.placeholder')

  return (
    <div className={cn('relative group max-w-2xl w-full min-w-0', className)}>
      <Search className='size-4 sm:size-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/80 group-focus-within:text-primary transition-all duration-300' />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={resolvedPlaceholder}
        className={cn(
          'pl-10! md:pl-12!',
          count || rightAdornment ? 'pr-17 sm:pr-12' : 'pr-10 md:pr-12',
        )}
      />
      {(count || rightAdornment) && (
        <div className='md:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
          {count && (
            <span className='bg-primary text-background px-1.5 py-0.5 rounded-full text-xs font-bold'>
              {count}
            </span>
          )}
          {rightAdornment}
        </div>
      )}
    </div>
  )
}

export default SearchBar
