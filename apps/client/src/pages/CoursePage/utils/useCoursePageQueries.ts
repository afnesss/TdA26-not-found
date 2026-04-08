import { getCourseById, getCourses } from '@/api/queries/courseQueries'
import {
  CourseDetailSchema,
  type CourseDetail,
  type CourseSummary,
} from '@/lib/schemas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type CourseQueryError = Error & { status?: number }

const fetchCourse = async (
  id: string,
  orgSlug?: string,
): Promise<CourseDetail> => {
  try {
    const raw = await getCourseById(id, orgSlug)
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

export const useCoursePageQueries = (id?: string, orgSlug?: string) => {
  const { i18n } = useTranslation()
  const uiLocale = i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'
  const queryClient = useQueryClient()

  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['course', id] })
    }
  }, [uiLocale, id, queryClient])

  const {
    data: coursesUser = [],
    isLoading: isCoursesUserLoading,
    isFetching: isCoursesUserFetching,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses-user', uiLocale],
    queryFn: () => getCourses(true, orgSlug),
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
    queryFn: () => fetchCourse(id!, orgSlug),
    enabled: Boolean(id),
    networkMode: 'always',
  })

  return {
    coursesUser,
    isCoursesUserLoading,
    isCoursesUserFetching,
    courseData,
    isLoading,
    isError,
    error,
    refetch,
  }
}
