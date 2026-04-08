import { pendingCloneIds } from '@/api/pendingCloneIds'
import i18n from '@/i18n'
import { getCurrentUiLocale, localizeCourseForUi } from '@/lib/courseLocalization'
import { buildOrgApiPrefix } from '@/lib/routes'
import type { CourseDetail, CourseSummary } from '@/lib/schemas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useDashboardCoursesSSE = (orgSlug?: string) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const uiLocale = getCurrentUiLocale()

  useEffect(() => {
    const isDev = import.meta.env.DEV
    const eventSource = new EventSource(
      `/api${buildOrgApiPrefix(orgSlug)}/courses/stream`,
    )

    eventSource.onopen = () => {
      if (isDev) console.log('SSE connected')
      setIsConnected(true)
    }

    eventSource.onerror = (err) => {
      if (isDev) console.log(' SSE error')
      if (isDev) console.error(' SSE onerror:', err)
      if (isDev) console.error('EventSource readyState:', eventSource.readyState)
      setIsConnected(false)
    }

    eventSource.addEventListener('course_upserted', (event) => {
      const updatedCourse = localizeCourseForUi(
        JSON.parse(event.data) as CourseSummary,
        uiLocale,
      )
      const updateCourses = (old: CourseSummary[] = []) => {
        for (const tempId of pendingCloneIds) {
          const tempIndex = old.findIndex((c) => c.uuid === tempId)
          if (tempIndex !== -1) {
            pendingCloneIds.delete(tempId)
            const next = [...old]
            next[tempIndex] = updatedCourse
            return next
          }
        }

        const exists = old.some((c) => c.uuid === updatedCourse.uuid)
        return exists
          ? old.map((c) => (c.uuid === updatedCourse.uuid ? updatedCourse : c))
          : [updatedCourse, ...old]
      }

      queryClient.setQueryData<CourseSummary[]>(['courses'], updateCourses)
      queryClient.setQueryData<CourseSummary[]>(
        ['courses', uiLocale],
        updateCourses,
      )
    })

    eventSource.addEventListener('course_auto_started', (event) => {
      const startedCourse = localizeCourseForUi(
        JSON.parse(event.data) as CourseSummary,
        uiLocale,
      )
      const updateCourses = (old: CourseSummary[] | undefined) => {
        if (!old) return old

        return old.map((c) =>
          c.uuid === startedCourse.uuid ? startedCourse : c,
        )
      }

      queryClient.setQueryData<CourseSummary[]>(['courses'], updateCourses)
      queryClient.setQueryData<CourseSummary[]>(
        ['courses', uiLocale],
        updateCourses,
      )

      toast.info(
        i18n.t('toasts.sse.courseAutoStarted', {
          ns: 'dashboard',
          name: startedCourse.name,
        }),
      )
    })

    eventSource.addEventListener('material_interaction_updated', (event) => {
      const payload = JSON.parse(event.data) as {
        courseId: string
        moduleId: string
        material: CourseDetail['modules'][number]['materials'][number]
      }

      queryClient.setQueryData<CourseDetail>(
        ['course', payload.courseId],
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            modules: oldData.modules.map((module) =>
              module.uuid !== payload.moduleId
                ? module
                : {
                    ...module,
                    materials: module.materials.map((material) =>
                      material.uuid === payload.material.uuid
                        ? payload.material
                        : material,
                    ),
                  },
            ),
          }
        },
      )

      queryClient.invalidateQueries({
        queryKey: ['course-dashboard-analytics', payload.courseId],
      })
    })

    eventSource.addEventListener('quiz_stats_updated', (event) => {
      const payload = JSON.parse(event.data) as {
        courseId: string
        moduleId: string
        quiz: CourseDetail['modules'][number]['quizzes'][number]
      }

      queryClient.setQueryData<CourseDetail>(
        ['course', payload.courseId],
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            modules: oldData.modules.map((module) =>
              module.uuid !== payload.moduleId
                ? module
                : {
                    ...module,
                    quizzes: module.quizzes.map((quiz) =>
                      quiz.uuid === payload.quiz.uuid ? payload.quiz : quiz,
                    ),
                  },
            ),
          }
        },
      )

      queryClient.invalidateQueries({
        queryKey: ['course-dashboard-analytics', payload.courseId],
      })
    })

    return () => {
      // console.log('SSE dashboard zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [queryClient, uiLocale])

  return { isConnected }
}


