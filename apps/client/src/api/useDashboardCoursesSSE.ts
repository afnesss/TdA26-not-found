import type { CourseSummary } from '@/lib/schemas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useDashboardCoursesSSE = () => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`/api/courses/stream`)

    eventSource.onopen = () => {
      console.log('✅ SSE připojeno')
      setIsConnected(true)
    }

    eventSource.onerror = (err) => {
      console.log(' SSE chyba')
      console.error(' SSE onerror:', err)
      console.error('EventSource readyState:', eventSource.readyState)
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

      toast.info(`Kurz ${startedCourse.name} automatický spuštěn`)
    })
    return () => {
      console.log('SSE dashboard zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [queryClient])

  return { isConnected }
}
