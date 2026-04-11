import { buildApiUrl } from '@/api/client'
import { buildOrgApiPrefix } from '@/lib/routes'
import type { CourseSummary } from '@/lib/schemas'
import { appendLocaleQuery } from '@/lib/i18n'
import { getCurrentUiLocale, localizeCourseForUi } from '@/lib/courseLocalization'
import i18n from '@/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useCoursesSSE = (orgSlug?: string) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const uiLocale = getCurrentUiLocale()

  useEffect(() => {
    const isDev = import.meta.env.DEV
    const eventSource = new EventSource(
      appendLocaleQuery(buildApiUrl(`${buildOrgApiPrefix(orgSlug)}/courses/stream`)),
    )

    eventSource.onopen = () => {
      if (isDev) console.log('Course SSE connected')
      setIsConnected(true)
    }

    eventSource.onerror = (err) => {
      if (isDev) console.log(' Course SSE error')
      if (isDev) console.error(' Course SSE onerror:', err)
      if (isDev)
        console.error('EventSource readyState:', eventSource.readyState)
      setIsConnected(false)
    }

    eventSource.addEventListener('course_upserted', (event) => {
      const newCourse = localizeCourseForUi(
        JSON.parse(event.data) as CourseSummary,
        uiLocale,
      )
      let toastMessage: string | null = null

      const updateCourses = (oldData: CourseSummary[] | undefined) => {
        if (!oldData) return oldData

        const existingCourse = oldData.find((c) => c.uuid === newCourse.uuid)
        const exists = Boolean(existingCourse)

        if (newCourse.status === 'paused' && existingCourse?.status === 'live') {
          toastMessage = i18n.t('toasts.sse.coursePausedByInstructor', {
            ns: 'dashboard',
            name: newCourse.name,
          })
        } else if (
          newCourse.status === 'live' &&
          existingCourse?.status !== 'live'
        ) {
          toastMessage = i18n.t('toasts.sse.courseStarted', {
            ns: 'dashboard',
            name: newCourse.name,
          })
        } else if (
          newCourse.status === 'planned' &&
          existingCourse?.status !== 'planned'
        ) {
          toastMessage = i18n.t('toasts.sse.courseScheduled', {
            ns: 'dashboard',
            name: newCourse.name,
          })
        } else if (
          newCourse.status === 'planned' &&
          existingCourse?.status === 'planned' &&
          newCourse.scheduledFor !== existingCourse.scheduledFor
        ) {
          toastMessage = i18n.t('toasts.sse.courseScheduleChanged', {
            ns: 'dashboard',
            name: newCourse.name,
          })
        }

        if (newCourse.status === 'draft' || newCourse.status === 'archived') {
          return oldData
        }

        return exists
          ? oldData.map((c: CourseSummary) =>
              c.uuid === newCourse.uuid ? newCourse : c,
            )
          : [newCourse, ...oldData]
      }

      queryClient.setQueryData<CourseSummary[]>(['courses-user'], updateCourses)
      queryClient.setQueryData<CourseSummary[]>(
        ['courses-user', uiLocale],
        updateCourses,
      )
      if (toastMessage) {
        toast.info(toastMessage)
      }
    })

    eventSource.addEventListener('course_removed', (event) => {
      const payload = JSON.parse(event.data) as
        | { uuid?: string; name?: string; status?: string }
        | string
      const payloadData = typeof payload === 'string' ? undefined : payload
      const courseIdToDelete =
        typeof payload === 'string' ? payload : payloadData?.uuid

      const existingCourse =
        queryClient
          .getQueryData<CourseSummary[]>(['courses-user', uiLocale])
          ?.find((course) => course.uuid === courseIdToDelete) ??
        queryClient
          .getQueryData<CourseSummary[]>(['courses-user'])
          ?.find((course) => course.uuid === courseIdToDelete)

      const removedCourseName = payloadData?.name ?? existingCourse?.name
      const removedCourseStatus = payloadData?.status ?? existingCourse?.status
      const isVisibleStatus =
        removedCourseStatus === 'live' ||
        removedCourseStatus === 'planned' ||
        removedCourseStatus === 'paused'
      const shouldNotify = Boolean(existingCourse) || isVisibleStatus

      if (shouldNotify) {
        if (removedCourseName && removedCourseStatus === 'archived') {
          toast.info(
            i18n.t('toasts.sse.courseCompletedByInstructor', {
              ns: 'dashboard',
              name: removedCourseName,
            }),
          )
        } else {
          toast.info(
            removedCourseName
              ? i18n.t('toasts.sse.courseDeletedByInstructorNamed', {
                  ns: 'dashboard',
                  name: removedCourseName,
                })
              : i18n.t('toasts.sse.courseDeletedByInstructorUnnamed', {
                  ns: 'dashboard',
                }),
          )
        }
      }

      const removeCourse = (oldData: CourseSummary[] | undefined) => {
        if (!oldData) return oldData
        if (!courseIdToDelete) return oldData

        return oldData.filter((c: CourseSummary) => c.uuid !== courseIdToDelete)
      }

      queryClient.setQueryData<CourseSummary[]>(['courses-user'], removeCourse)
      queryClient.setQueryData<CourseSummary[]>(
        ['courses-user', uiLocale],
        removeCourse,
      )

      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      queryClient.invalidateQueries({ queryKey: ['courses-user', uiLocale] })
    })

    return () => {
      if (isDev) console.log('Course SSE closing')
      eventSource.close()
      setIsConnected(false)
    }
  }, [queryClient, uiLocale])
  return { isConnected }
}
