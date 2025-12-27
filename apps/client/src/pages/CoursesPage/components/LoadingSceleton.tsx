
const LoadingSceleton = () => {
  return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className='bg-white rounded-xl p-5 animate-pulse border-2 border-gray-100'>
            <div className='h-3 bg-gray-200 rounded mb-4' />
            <div className='h-10 bg-gray-200 rounded-xl mb-3' />
            <div className='h-6 bg-gray-200 rounded mb-3 w-3/4' />
            <div className='h-4 bg-gray-200 rounded mb-2' />
            <div className='h-4 bg-gray-200 rounded w-5/6 mb-4' />
            <div className='flex justify-between pt-4 border-t border-gray-200'>
              <div className='h-4 bg-gray-200 rounded w-24' />
              <div className='h-8 w-8 bg-gray-200 rounded-full' />
            </div>
          </div>
        ))}
      </div>
  )
}

export default LoadingSceleton
