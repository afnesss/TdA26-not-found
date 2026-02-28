import { Skeleton } from '@/components/ui/skeleton'
import { MaterialSkeleton } from './MaterialSkeleton'
import { QuizSkeleton } from './QuizSkeleton'

const CourseSkeleton = () => {
  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pb-8 space-y-8'>
        {/* summary */}
        <section>
          <div className='bg-background rounded-xl border border-gray-100 overflow-hidden'>
            <div className='bg-linear-to-r from-secondary to-accent-teal-light h-2' />
            <div className='px-5 md:px-6 py-5 gap-3 flex flex-col'>
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
          <MaterialSkeleton count={2} />
        </section>

        {/* quizzes  */}
        <section>
          <Skeleton className='h-8 w-32 mb-4' />
          <QuizSkeleton count={2} />
        </section>
      </div>
    </div>
  )
}

export default CourseSkeleton
