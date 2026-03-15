import type { CourseDetail, CourseSummary } from '@/lib/schemas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useDashboardCoursesSSE = () => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const isDev = import.meta.env.DEV
    const eventSource = new EventSource(`/api/courses/stream`)

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
      const updatedCourse = JSON.parse(event.data) as CourseSummary

      queryClient.setQueryData<CourseSummary[]>(['courses'], (old = []) => {
        const exists = old.some((c) => c.uuid === updatedCourse.uuid)
        return exists
          ? old.map((c) => (c.uuid === updatedCourse.uuid ? updatedCourse : c))
          : [updatedCourse, ...old]
      })
    })

    eventSource.addEventListener('course_auto_started', (event) => {
      const startedCourse = JSON.parse(event.data) as CourseSummary

      queryClient.setQueryData<CourseSummary[]>(['courses'], (old) => {
        if (!old) return old

        return old.map((c) =>
          c.uuid === startedCourse.uuid ? startedCourse : c,
        )
      })

      toast.info(`Kurz ${startedCourse.name} byl automaticky spuštěn`)
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
  }, [queryClient])

  return { isConnected }
}



