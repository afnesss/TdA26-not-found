import { Skeleton } from '@/components/ui/skeleton'

type CoursesPageSkeletonProps = {
  containerClassName?: string
}

const CoursesPageSkeleton = ({
  containerClassName = 'mx-auto',
}: CoursesPageSkeletonProps) => {
  return (
    <div className='h-full'>
      <div className={containerClassName}>
        {/* Courses Grid Section */}
        <div className='relative'>
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
