import { Skeleton } from '@/components/ui/skeleton'

type MaterialSkeletonProps = {
  count?: number
}

export const MaterialSkeleton = ({ count = 3 }: MaterialSkeletonProps) => {
  return (
    <section className='space-y-3'>
      {/* Header with title and add button */}
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-10 w-32 rounded-lg' />
      </div>

      {/* Material cards */}
      <div className='grid gap-4'>
        {[...Array(count)].map((_, i) => (
          <div key={i} className='bg-background rounded-xl shadow-md p-3 sm:p-4'>
            <div className='flex items-start gap-2 md:gap-4'>
              <Skeleton className='w-6 h-6 rounded-lg shrink-0 mt-1' />
              <div className='flex-1 min-w-0 space-y-2'>
                <div className='flex justify-between gap-2'>
                  <Skeleton className='h-5 w-3/5' />
                  <div className='flex items-center gap-1'>
                    <Skeleton className='w-8 h-8 rounded-lg' />
                    <Skeleton className='w-8 h-8 rounded-lg' />
                  </div>
                </div>
                <Skeleton className='h-4 w-4/5' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
