import { useEffect, useState } from 'react'
// import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
// import type { Course } from '@/lib/types';
import { CourseDetailSchema, type CourseDetail, type Quiz } from '@/lib/schemas'
import { getCourseById } from '@/api/queries/courseQueries'
import { useParams } from 'react-router'
import QuizesSection from './components/QuizesSection'
import SummarySection from './components/SummarySection'
import MaterialsSection from './components/MaterialsSection'
import FeedSection from './components/FeedSection'
import { useQuery } from '@tanstack/react-query'
import CourseSkeleton from './components/CoursePageSkeleton'
import { fetchWithValidation } from '@/api/fetchwithValid'

const CoursePage = () => {
  // const [courseData, setCourseData] = useState<CourseDetail  | null>(null);
  const { id } = useParams<{ id: string }>()

  const fetchCourse = async (id: string): Promise<CourseDetail> => {
    try {
      const raw = await getCourseById(id!)
      if (!raw) {
        throw new Error('Course not found')
      }
      const parsed = CourseDetailSchema.safeParse(raw)

      if (!parsed.success) {
        console.error('Course schema validation failed', parsed.error)
        throw new Error('Invalid course data')
      }

      return parsed.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseDetail, Error>({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return <CourseSkeleton />
  }

  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>
      <div className='max-w-7xl mx-auto md:px-6 lg:px-12 pb-8 space-y-8'>
        <SummarySection
          name={courseData?.name}
          description={courseData?.description ?? undefined}
        />

        <MaterialsSection materials={courseData?.materials ?? []} />

        <QuizesSection courseData={courseData} />

        <FeedSection feed={courseData?.feed ?? []} />
      </div>
    </div>
  )
}

export default CoursePage
