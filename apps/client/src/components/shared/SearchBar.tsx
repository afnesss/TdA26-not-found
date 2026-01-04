import React, { type SetStateAction } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'

type SearchBarProps = {
  searchQuery: string
  setSearchQuery: (value: SetStateAction<string>) => void
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className='relative group max-w-2xl w-full'>
      <Search
        className='absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 
                    group-focus-within:text-primary transition-all duration-300'
        size={20}
      />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder='Vyhledat kurz...'
        className='pl-12 pr-12'
      />
    </div>
  )
}

export default SearchBar
