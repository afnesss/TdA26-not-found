import type { CourseSummary } from '@/lib/schemas'
import { useQueryClient } from '@tanstack/react-query'
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
      const payload = JSON.parse(event.data) as
        | { uuid?: string; name?: string; status?: string }
        | string
      const payloadData = typeof payload === 'string' ? undefined : payload
      const courseIdToDelete =
        typeof payload === 'string' ? payload : payloadData?.uuid

      const existingCourse = queryClient
        .getQueryData<CourseSummary[]>(['courses-user'])
        ?.find((course) => course.uuid === courseIdToDelete)

      const removedCourseName =
        payloadData?.name ?? existingCourse?.name
      const removedCourseStatus = payloadData?.status ?? existingCourse?.status

      if (removedCourseName && removedCourseStatus === 'paused') {
        toast.info(`Kurz "${removedCourseName}" pozastaveno lektorem`)
      }
      if (removedCourseName && removedCourseStatus === 'archived') {
        toast.info(`Kurz "${removedCourseName}" dokončeno lektorem`)
      }

      queryClient.setQueryData<CourseSummary[]>(['courses-user'], (oldData) => {
        if (!oldData) return oldData
        if (!courseIdToDelete) return oldData

        return oldData.filter((c: CourseSummary) => c.uuid !== courseIdToDelete)
      })

      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
    })

    return () => {
      console.log('SSE kurzu zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [queryClient])
  return { isConnected }
}
