import type { CourseDetail, CourseSummary, FeedItem } from '@/lib/schemas'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useCoursesSSE = () => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`/api/courses/stream`)

    eventSource.onopen = () => {
      console.log('✅ SSE kurzu připojeno')
      setIsConnected(true)
    }

    eventSource.onerror = (err) => {
      console.log(' SSE kurzu chyba')
      console.error(' SSE kurzu onerror:', err)
      console.error('EventSource readyState:', eventSource.readyState)
      setIsConnected(false)
      eventSource.close()
    }

    eventSource.addEventListener('course_upserted', (event) => {
      const newCourse = JSON.parse(event.data) as CourseSummary
      let toastMessage: string | null = null

      queryClient.setQueryData<CourseSummary[]>(['courses-user'], (oldData) => {
        if (!oldData) return oldData

        const existingCourse = oldData.find((c) => c.uuid === newCourse.uuid)
        const exists = Boolean(existingCourse)

        if (newCourse.status === 'live' && existingCourse?.status !== 'live') {
          toastMessage = `Kurz "${newCourse.name}" byl spuštěn`
        } else if (
          newCourse.status === 'planned' &&
          existingCourse?.status !== 'planned'
        ) {
          toastMessage = `Kurz "${newCourse.name}" byl naplánován`
        } else if (
          newCourse.status === 'planned' &&
          existingCourse?.status === 'planned' &&
          newCourse.scheduledFor !== existingCourse.scheduledFor
        ) {
          toastMessage = `Termín kurzu "${newCourse.name}" byl změněn`
        }

        if (newCourse.status !== 'planned' && newCourse.status !== 'live')
          return oldData

        return exists
          ? oldData.map((c: CourseSummary) =>
              c.uuid === newCourse.uuid ? newCourse : c,
            )
          : [newCourse, ...oldData]
      })
      if (toastMessage) {
        toast.info(toastMessage)
      }
    })

    eventSource.addEventListener('course_removed', (event) => {
      const payload = JSON.parse(event.data) as { uuid?: string } | string
      const courseIdToDelete =
        typeof payload === 'string' ? payload : payload.uuid

      queryClient.setQueryData<CourseSummary[]>(['courses-user'], (oldData) => {
        if (!oldData) return oldData
        if (!courseIdToDelete) return oldData

        return oldData.filter((c: CourseSummary) => c.uuid !== courseIdToDelete)
      })
    })

    return () => {
      console.log('SSE kurzu zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [queryClient])
  return { isConnected }
}
