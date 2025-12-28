import React from 'react'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Props =  {
  onClick: () => void
}

const EmptyStateComp = ({onClick}: Props) => {
  return (
    <div className='text-center py-16'>
      <div className='w-22 h-22 bg-secondary/20 rounded-full flex items-center 
                  justify-center mx-auto mb-6'>
        <Search size={45} className='text-primary' />
      </div>
    <Label asChild variant="emptyState"size="xl">
      <h3>Žádné kurzy nenalezeny</h3>
    </Label>

      <Button variant='primary'size='primary' 
        onClick={onClick}>
        Vymazat vyhledávání
      </Button>
    </div>
  )
}

export default EmptyStateComp
