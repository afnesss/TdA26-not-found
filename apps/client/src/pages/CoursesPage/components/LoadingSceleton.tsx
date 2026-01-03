import { Skeleton } from '@/components/ui/skeleton'

const CoursesPageSkeleton = () => {
  return (
    <div className='h-full'>
      {/* Hero Section */}
      <div className='max-w-7xl mx-auto px-4 pt-3'>
        <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-center items-center pb-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='flex items-center w-45 h-9 gap-2 px-3 py-2 rounded-full  bg-gray-200'></Skeleton>
          </div>

          <div className='relative max-w-2xl w-full'>
            <Skeleton className='h-10 w-full rounded-xl bg-gray-200' />
          </div>
        </div>

        {/* Filters Section */}
        <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
          <div className='flex flex-wrap gap-3 justify-center'>
            <Skeleton className='h-8 w-32 rounded-lg bg-gray-200' />
            <Skeleton className='h-8 w-28 rounded-lg bg-background border border-gray-200' />
            <Skeleton className='h-8 w-44 rounded-lg bg-background border border-gray-200' />
          </div>
        </div>

        {/* Courses Grid Section */}
        <div className='relative py-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='bg-background rounded-xl shadow-sm border border-gray-100 overflow-hidden'
              >
                <div className='p-6 flex flex-col gap-4'>
                  {/* Title */}
                  <Skeleton className='h-6 w-3/4' />

                  {/* Description - 3 lines */}
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-4/5' />
                  </div>

                  {/* Footer: Date + Button */}
                  <div className='flex justify-between items-center pt-4 mt-auto'>
                    {/* Date with icon */}
                    <div className='flex items-center gap-2'>
                      <div className='space-y-1'>
                        <Skeleton className='h-3 w-20' />
                        <Skeleton className='h-3 w-28' />
                      </div>
                    </div>

                    {/* Zobrazit button */}
                    <Skeleton className='h-10 w-24 rounded-lg' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursesPageSkeleton
