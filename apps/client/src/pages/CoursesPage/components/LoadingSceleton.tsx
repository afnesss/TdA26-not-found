import { Skeleton } from "@/components/ui/skeleton"

const LoadingSkeleton = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className='bg-white rounded-xl p-5 border-2 border-gray-100'>
          <Skeleton className='h-3 rounded mb-4' />
          <Skeleton className='h-10 rounded-xl mb-3' />
          <Skeleton className='h-6 rounded mb-3 w-3/4' />
          <Skeleton className='h-4 rounded mb-2' />
          <Skeleton className='h-4 rounded w-5/6 mb-4' />
          <div className='flex justify-between pt-4 border-t border-gray-200'>
            <Skeleton className='h-4 rounded w-24' />
            <Skeleton className='h-8 w-8 rounded-full' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton