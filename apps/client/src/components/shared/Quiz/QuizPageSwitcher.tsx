import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type QuizPageSwitcherProps = {
  pageCount: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

const QuizPageSwitcher = ({
  pageCount,
  currentPage,
  onPageChange,
  className,
}: QuizPageSwitcherProps) => {
  if (pageCount <= 1) return null

  return (
    <div className={cn('flex justify-center border-t border-gray-100 pt-3', className)}>
      <div className='flex items-center gap-1.5 rounded-full border border-gray-100 bg-white/80 px-2 py-1 shadow-sm'>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label='Předchozí stránka'
        >
          ‹
        </Button>

        {Array.from({ length: pageCount }, (_, index) => (
          <Button
            key={index}
            variant='ghost'
            size='sm'
            className={cn(
              'h-7 min-w-7 px-2 text-xs',
              index === currentPage
                ? 'bg-primary text-background'
                : 'text-primary',
            )}
            onClick={() => onPageChange(index)}
          >
            {index + 1}
          </Button>
        ))}

        <Button
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount - 1}
          aria-label='Další stránka'
        >
          ›
        </Button>
      </div>
    </div>
  )
}

export default QuizPageSwitcher
