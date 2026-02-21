import { getCourseById, getCourses } from '@/api/queries/courseQueries'
import {
  CourseDetailSchema,
  type CourseDetail,
  type CourseSummary,
} from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'

type CourseQueryError = Error & { status?: number }

const fetchCourse = async (id: string): Promise<CourseDetail> => {
  try {
    const raw = await getCourseById(id)
    if (!raw) {
      throw Object.assign(new Error('Course not found'), { status: 404 })
    }
    const parsed = CourseDetailSchema.safeParse(raw)

    if (!parsed.success) {
      console.error('Course schema validation failed', parsed.error)
      throw new Error('Invalid course data')
    }

    return parsed.data
  } catch (err) {
    console.error(err)
    const error = err as { status?: number; message?: string }

    if (error.status) {
      throw Object.assign(new Error(error.message || 'Request failed'), {
        status: error.status,
      })
    }

    throw err
  }
}

export const useCoursePageQueries = (id?: string) => {
  const { data: coursesUser = [], isLoading: isCoursesUserLoading } = useQuery<
    CourseSummary[]
  >({
    queryKey: ['courses-user'],
    queryFn: () => getCourses(true),
    enabled: Boolean(id),
    networkMode: 'always',
  })

  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CourseDetail, CourseQueryError>({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: Boolean(id),
    networkMode: 'always',
  })

  return {
    coursesUser,
    isCoursesUserLoading,
    courseData,
    isLoading,
    isError,
    error,
    refetch,
  }
}
