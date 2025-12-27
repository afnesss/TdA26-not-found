import React from 'react'
import { Button } from '@/components/ui/button';
import type { FilterIds } from '@/lib/constants';
import { filters } from '@/lib/constants';

type FiltersProps={
  selectedFilter: FilterIds,
  setSelectedFilter: (a: FilterIds) => void
}
const Filters = ({selectedFilter, setSelectedFilter}: FiltersProps) => {
  return (
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
        <div className='flex flex-wrap gap-3 justify-center'>
          {filters.map((filter) => (
            <Button
              variant='filter'
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                       ${selectedFilter === filter.id 
                         ? 'bg-primary text-background shadow-md' 
                         : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <filter.icon className='max-sm:w-3 max-sm:h-3 h-4 w-4' />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

  )
}

export default Filters
