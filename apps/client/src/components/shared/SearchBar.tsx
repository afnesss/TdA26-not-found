import React, { type SetStateAction } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

type SearchBarProps = {
  searchQuery: string
  setSearchQuery: (value: SetStateAction<string>) => void
  count?: string
  className?: string
}

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  count,
  className,
}: SearchBarProps) => {
  return (
    <div className={cn('relative group max-w-2xl w-full min-w-0', className)}>
      <Search className='size-4 sm:size-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/80 group-focus-within:text-primary transition-all duration-300' />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder='Vyhledat kurz...'
        className='pl-10! md:pl-12! pr-10 md:pr-12 '
      />
      {count && (
        <span className='lg:hidden absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-background px-1.5 md:px-2 py-0.5 rounded-full text-xs font-bold'>
          {count}
        </span>
      )}
    </div>
  )
}

export default SearchBar
