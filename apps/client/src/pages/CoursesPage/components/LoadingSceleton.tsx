import { Skeleton } from "@/components/ui/skeleton"

const CoursesPageSkeleton = () => {
  return (
    <div className='h-full'>
      
      {/* Hero Section Skeleton */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pt-3 pb-6'>
        <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-center items-center'>
          
          {/* HintPageText Skeleton */}
          <div className='flex items-center gap-3'>
            <Skeleton className='w-10 h-10 rounded-full' />
            <Skeleton className='h-8 w-48' />
          </div>
          
          <Skeleton className='h-12 w-full lg:w-96 rounded-xl' />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className='border-y border-gray-100 bg-gray-50/50'>
        <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 py-4'>
          <div className='flex gap-2 overflow-x-auto'>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className='h-10 w-24 rounded-lg shrink-0' />
            ))}
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 py-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className='bg-white rounded-xl border-2 border-gray-100 overflow-hidden'>
              <Skeleton className='h-2 rounded-none' />
              
              <div className='p-4 md:p-6 flex flex-col justify-between'>
                <div>
                  <Skeleton className='h-7 w-3/4 mb-4' />
                  <Skeleton className='h-4 w-full mb-2' />
                  <Skeleton className='h-4 w-5/6 mb-4' />
                </div>

                <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-10 w-28 rounded-lg' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoursesPageSkeleton