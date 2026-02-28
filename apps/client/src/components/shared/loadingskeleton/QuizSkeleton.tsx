import { Skeleton } from '@/components/ui/skeleton'

type QuizSkeletonProps = {
  count?: number
}

export const QuizSkeleton = ({ count = 3 }: QuizSkeletonProps) => {
  return (
    <section className='space-y-4'>
      {/* Header with title and add button */}
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-10 w-24 rounded-lg' />
      </div>

      {/* Quiz cards */}
      <div className='space-y-3'>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className='bg-background rounded-xl shadow-lg overflow-hidden border border-gray-100'
          >
            <div className='p-3.5 md:px-5 md:py-4'>
              <div className='flex items-center justify-between gap-2 sm:gap-4'>
                <div className='flex-1 min-w-0'>
                  <Skeleton className='h-5 sm:h-6 md:h-7 w-3/4 mb-2' />
                  <div className='flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-28' />
                  </div>
                </div>
                <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
                  <Skeleton className='w-8 h-8 rounded-lg' />
                  <Skeleton className='w-8 h-8 rounded-lg' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
