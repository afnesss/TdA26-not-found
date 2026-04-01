import { Skeleton } from '@/components/ui/skeleton'

const CourseLeaderboardSkeleton = () => {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-7 w-52' />
        <Skeleton className='h-10 w-36 rounded-2xl' />
      </div>

      <div className='rounded-2xl border border-border/70 bg-background p-3 shadow-sm sm:p-4'>
        <div className='overflow-hidden rounded-2xl bg-sky-50/55'>
          <div className='divide-y divide-border/55'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='flex items-center gap-3 px-3 py-3 sm:px-4'
              >
                <Skeleton className='h-7 w-7 rounded-full shrink-0' />
                <div className='flex flex-1 min-w-0 items-center justify-between gap-3'>
                  <Skeleton className='h-5 w-32 sm:w-40' />
                  <div className='grid shrink-0 grid-cols-3 gap-2'>
                    <Skeleton className='h-7 w-14 rounded-full' />
                    <Skeleton className='h-7 w-14 rounded-full' />
                    <Skeleton className='h-7 w-14 rounded-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CourseLeaderboardSkeleton
