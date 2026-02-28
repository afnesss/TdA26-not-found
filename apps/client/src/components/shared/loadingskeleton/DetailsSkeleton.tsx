// components/shared/skeletons/CourseDetailSkeleton.tsx
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MaterialSkeleton } from './MaterialSkeleton'
import { QuizSkeleton } from './QuizSkeleton'
import { FeedSkeleton } from './FeedSkeleton'

export const DetailsContentSkeleton = () => {
  return (
    <Card className='bg-background rounded-xl shadow-md overflow-hidden'>
      <div className='h-2 bg-gray-200 rounded-none' />

      <div className='p-4 lg:p-6 -mt-2'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 mb-2'>
          <Skeleton className='h-3 w-20' />
          <Skeleton className='h-3 w-3 rounded-full' />
          <Skeleton className='h-3 w-24' />
        </div>

        {/* Title */}
        <Skeleton className='h-8 w-48 mb-5' />

        {/* Form Fields */}
        <div className='space-y-4 mt-5'>
          {/* Name Field */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>

          {/* Description Field */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>
        </div>

        {/* Footer */}
        <div className='flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center gap-4 pt-8'>
          <div className='flex flex-row gap-10'>
            <div>
              <Skeleton className='h-3 w-24 mb-2' />
              <Skeleton className='h-5 w-20' />
            </div>
            <div>
              <Skeleton className='h-3 w-24 mb-2' />
              <Skeleton className='h-5 w-20' />
            </div>
          </div>
          <Skeleton className='h-10 w-32 rounded-xl' />
        </div>
      </div>
    </Card>
  )
}

export const MaterialsContentSkeleton = () => {
  return <MaterialSkeleton count={3} />
}

export const QuizzesContentSkeleton = () => {
  return <QuizSkeleton count={3} />
}

export const FeedContentSkeleton = () => {
  return <FeedSkeleton count={3} />
}
