import { Skeleton } from '@/components/ui/skeleton'

const DashboardCourseOverviewSkeleton = () => {
  return (
    <div className='space-y-5'>
      <div className='bg-background rounded-xl border border-gray-100 overflow-hidden'>
        <div className='bg-linear-to-r from-secondary to-accent-teal-dark h-2' />
        <div className='p-5 md:p-6 space-y-5'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-6 w-28 rounded-full' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-24 rounded-lg' />
              <Skeleton className='h-9 w-24 rounded-lg' />
            </div>
          </div>

          <div className='space-y-3'>
            <Skeleton className='h-10 w-full rounded-xl' />
            <Skeleton className='h-24 w-full rounded-xl' />
          </div>

          <div className='flex justify-end'>
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      </div>

      <div className='bg-background rounded-xl border border-gray-100 p-5 md:p-6 space-y-4'>
        <div className='flex items-center justify-between gap-3'>
          <Skeleton className='h-8 w-44' />
          <Skeleton className='h-9 w-32 rounded-lg' />
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='rounded-xl border border-gray-100 p-4 space-y-2'>
              <Skeleton className='h-5 w-1/3' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardCourseOverviewSkeleton
