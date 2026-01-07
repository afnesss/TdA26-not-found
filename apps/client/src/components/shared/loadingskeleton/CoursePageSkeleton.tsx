import { Skeleton } from "@/components/ui/skeleton"

const CourseSkeleton = () => {
  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pb-8 space-y-8'>
        
        {/* summary */}
        <section>
          <div className="bg-background rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-secondary to-accent-teal-light h-2" />
            <div className="px-5 md:px-6 py-5 gap-3 flex flex-col">
              <div className='flex md:flex-row gap-3 items-center'>
                <Skeleton className='h-8 w-20 rounded-lg' />
                <Skeleton className='h-8 w-64' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
            </div>
          </div>
        </section>

        {/* materials */}
        <section>
          <Skeleton className='h-8 w-48 mb-4' />
          <div className='space-y-3'>
            {[1, 2].map(i => (
              <div
                key={i}
                className='bg-background rounded-xl p-4 border border-gray-100'
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3 flex-1'>
                    <Skeleton className='w-6 h-6 rounded-lg' />
                    <div className='flex-1'>
                      <Skeleton className='h-5 w-48 mb-2' />
                      <Skeleton className='h-4 w-20' />
                    </div>
                  </div>
                  <Skeleton className='h-10 w-28 rounded-lg' />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* quizzes  */}
        <section>
          <Skeleton className='h-8 w-32 mb-4' />
          <div className='space-y-4'>
            {[1, 2].map(i => (
              <div
                key={i}
                className='bg-background rounded-xl shadow-lg border border-gray-100'
              >
                <div className='p-5'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4 flex-1'>
                      <div className='flex-1'>
                        <Skeleton className='h-6 w-56 mb-3' />
                          <Skeleton className='h-4 w-32' />
                      </div>
                    </div>
                    <Skeleton className='w-10 h-10 rounded-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default CourseSkeleton