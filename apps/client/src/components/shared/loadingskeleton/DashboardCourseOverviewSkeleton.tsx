import { Skeleton } from '@/components/ui/skeleton'

const DashboardCourseOverviewSkeleton = () => {
  return (
    <div className='max-w-7xl mx-auto  py-6 space-y-5'>
      {/* EditableDetailCard */}
      <div className='bg-background rounded-xl border border-gray-100 overflow-hidden'>
        <div className='bg-linear-to-r from-accent-teal to-accent-teal-dark h-2' />
        <div className='p-5 md:p-6 space-y-5'>
          {/* Header: Badge + Actions */}
          <div className='flex items-center justify-between gap-4'>
            <Skeleton className='h-6 w-28 rounded-full' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-24 rounded-lg' />
              <Skeleton className='h-9 w-24 rounded-lg' />
            </div>
          </div>

          {/* Form Fields: Name + Description */}
          <div className='space-y-3'>
            <Skeleton className='h-10 w-full rounded-xl' />
            <Skeleton className='h-24 w-full rounded-xl' />
          </div>

          {/* Footer: Save button */}
          <div className='flex justify-end'>
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className='space-y-4'>
        {/* Section title */}
        <Skeleton className='h-7 w-40' />

        {/* Grid wrapper OUTSIDE map */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='bg-background rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm'
            >
              <div className='flex items-start justify-between gap-4'>
                {/* Left side */}
                <div className='flex gap-4 min-w-0'>
                  {/* Number circle */}
                  <Skeleton className='h-6 w-6 rounded-full shrink-0' />

                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </div>

                {/* Button */}
                <Skeleton className='h-9 w-24 rounded-lg shrink-0' />
              </div>

              {/* Divider */}
              <div className='border-t border-gray-100' />

              {/* Materials + Quizzes */}
              <div className='flex items-center gap-6'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardCourseOverviewSkeleton
