import { Skeleton } from '@/components/ui/skeleton'

type FeedSkeletonProps = {
  count?: number
}

export const FeedSkeleton = ({ count = 3 }: FeedSkeletonProps) => {
  return (
    <div className='bg-background rounded-xl shadow-md p-2 sm:p-3 md:p-6'>
      <div className='space-y-4'>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className='px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border-l-4 border-primary bg-primary/5'
          >
            {/* Header */}
            <div className='flex items-start justify-between gap-2 mb-2'>
              <div className='flex flex-col gap-1.5 flex-1'>
                {/* Badge + Date */}
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-20 rounded' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
              {/* Buttons */}
              <div className='flex gap-1'>
                <Skeleton className='w-8 h-8 rounded-lg' />
                <Skeleton className='w-8 h-8 rounded-lg' />
              </div>
            </div>

            {/* Content */}
            <Skeleton className='h-4 w-4/5' />
          </div>
        ))}
      </div>
    </div>
  )
}
