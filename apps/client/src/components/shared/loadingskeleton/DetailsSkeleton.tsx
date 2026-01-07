// components/shared/skeletons/CourseDetailSkeleton.tsx
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
            <Skeleton className='h-32 w-full rounded-xl' />
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
  return (
    <div className='grid gap-4'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='bg-background rounded-xl shadow-md p-3 sm:p-4'>
          <div className='flex items-start gap-2 md:gap-4'>
            {/* Icon */}
            <Skeleton className='w-6 h-6 rounded-lg shrink-0 mt-1' />

            {/* Content */}
            <div className='flex-1 min-w-0 space-y-2'>
              {/* Title + Buttons */}
              <div className='flex justify-between gap-2'>
                <Skeleton className='h-5 w-3/5' />
                <div className='flex items-center gap-1'>
                  <Skeleton className='w-8 h-8 rounded-lg' />
                  <Skeleton className='w-8 h-8 rounded-lg' />
                  <Skeleton className='w-8 h-8 rounded-lg' />
                </div>
              </div>

              {/* Description */}
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-2/3' />

              {/* File size */}
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const QuizzesContentSkeleton = () => {
  return (
    <div className='grid gap-4'>
      {[1, 2].map((i) => (
        <div key={i} className='bg-background rounded-xl shadow-md p-3 sm:p-4'>
          {/* Header */}
          <div className='flex items-center justify-between gap-4 mb-4'>
            <div className='flex items-center gap-4 flex-1'>
              <div className='flex-1 space-y-2'>
                {/* Title */}
                <Skeleton className='h-6 w-3/4' />
                {/* Stats */}
                <div className='flex gap-4'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className='flex items-center gap-2'>
              <Skeleton className='w-8 h-8 rounded-lg' />
              <Skeleton className='w-8 h-8 rounded-full' />
            </div>
          </div>

          {/* Questions Preview */}
          <div className='space-y-3 pl-4 border-l-2 border-gray-200'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/3' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const FeedContentSkeleton = () => {
  return (
    <div className='bg-background rounded-xl shadow-md p-2 sm:p-3 md:p-6'>
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border-l-4 border-primary bg-primary/5'
          >
            {/* Header */}
            <div className='flex items-start justify-between gap-2 mb-2'>
              <div className='flex flex-col gap-1.5 flex-1'>
                {/* Badge + Date */}
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-20 rounded' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
              {/* Buttons */}
              <div className='flex gap-1'>
                <Skeleton className='w-8 h-8 rounded-lg' />
                <Skeleton className='w-8 h-8 rounded-lg' />
              </div>
            </div>

            {/* Content */}
            <Skeleton className='h-4 w-full mb-1' />
            <Skeleton className='h-4 w-4/5' />
          </div>
        ))}
      </div>
    </div>
  )
}
