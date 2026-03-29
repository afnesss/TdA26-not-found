import { useState } from 'react'
import { toast } from 'sonner'
import type { CourseStatus, CourseSummary } from '@/lib/schemas'
import { updateCourse } from '@/api/queries/courseQueries'
import type { QueryClient } from '@tanstack/react-query'
import { formatDateTimeLocal, toDateTimeLocalValue } from './helperFunctions'
import type { CoursePlanningState } from '@/pages/CoursesPage/components/CardDate'
import { invalidateCourseQueries } from './useCourseMutation'

type UseCoursePlanningOptions = {
  courseId?: string
  orgSlug?: string
  queryClient?: QueryClient
  onSuccess?: () => void
}

export function useCoursePlanning(options: UseCoursePlanningOptions = {}) {
  const { courseId, orgSlug, queryClient, onSuccess } = options

  const [planningCourseId, setPlanningCourseId] = useState<string | null>(
    courseId ?? null,
  )
  const [planningDateTime, setPlanningDateTime] = useState('')
  const [planningNeedsStatusUpdate, setPlanningNeedsStatusUpdate] =
    useState(false)
  const [planningError, setPlanningError] = useState('')
  const [planningSaving, setPlanningSaving] = useState(false)
  const [planningIsEditing, setPlanningIsEditing] = useState(false)

  const closePlanningEditor = () => {
    setPlanningCourseId(null)
    setPlanningDateTime('')
    setPlanningNeedsStatusUpdate(false)
    setPlanningError('')
    setPlanningSaving(false)
    setPlanningIsEditing(false)
  }

  const openPlanningEditor = (
    course: CourseSummary,
    needsStatusUpdate: boolean,
  ) => {
    const existingValue = toDateTimeLocalValue(course.scheduledFor)
    const defaultDate = new Date()
    defaultDate.setHours(defaultDate.getHours() + 1)
    const defaultValue = formatDateTimeLocal(defaultDate)

    setPlanningCourseId(course.uuid)
    setPlanningDateTime(existingValue || defaultValue)
    setPlanningNeedsStatusUpdate(needsStatusUpdate)
    setPlanningError('')
    setPlanningSaving(false)
    setPlanningIsEditing(true)
  }

  const handlePlanningConfirm = async () => {
    if (!planningCourseId) return

    if (!planningDateTime) {
      const message = 'Vyberte datum a čas'
      setPlanningError(message)
      toast.error(message)
      return
    }

    const selectedDate = new Date(planningDateTime)
    if (Number.isNaN(selectedDate.getTime())) {
      const message = 'Neplatný formát data'
      setPlanningError(message)
      toast.error(message)
      return
    }

    const now = new Date()
    if (selectedDate <= now) {
      const message = 'Datum musí být v budoucnosti'
      setPlanningError(message)
      toast.error(message)
      return
    }

    setPlanningSaving(true)

    try {
      const payload = planningNeedsStatusUpdate
        ? {
            status: 'planned' as CourseStatus,
            scheduledFor: selectedDate.toISOString(),
          }
        : { scheduledFor: selectedDate.toISOString() }

      await updateCourse(planningCourseId, payload, orgSlug)

      if (queryClient && planningCourseId) {
        await invalidateCourseQueries(queryClient, planningCourseId)
      }

      toast.success(
        planningNeedsStatusUpdate
          ? 'Kurz byl naplánován'
          : 'Termín kurzu byl změněn',
      )

      onSuccess?.()
      closePlanningEditor()
    } catch {
      toast.error('Nepodařilo se uložit termín kurzu')
      setPlanningSaving(false)
    }
  }

  const createPlanningState = (course: CourseSummary): CoursePlanningState => ({
    editable: course.status === 'planned',
    isEditing: planningIsEditing && planningCourseId === course.uuid,
    value: planningCourseId === course.uuid ? planningDateTime : '',
    error: planningCourseId === course.uuid ? planningError : '',
    saving: planningCourseId === course.uuid && planningSaving,
    onOpen: () => openPlanningEditor(course, false),
    onChange: (value: string) => {
      setPlanningDateTime(value)
      if (planningError) setPlanningError('')
    },
    onConfirm: handlePlanningConfirm,
    onCancel: closePlanningEditor,
  })

  /**
   * Handles status change for a course, with special handling for 'planned' status.
   * @param courseId - ID of the course to update
   * @param newStatus - New status to set
   * @param courses - Optional array of courses to find the course for planning editor
   */
  const handleStatusChange = async (
    courseId: string,
    newStatus: CourseStatus,
    courses?: CourseSummary[],
  ) => {
    const statusMessages: Record<CourseStatus, string> = {
      draft: 'Kurz byl převeden do návrhu',
      planned: 'Kurz byl naplánován',
      live: 'Kurz byl spuštěn',
      paused: 'Kurz byl pozastaven',
      archived: 'Kurz byl archivován',
    }

    if (newStatus === 'planned') {
      const course = courses?.find((c) => c.uuid === courseId)
      if (!course) {
        toast.error('Kurz nebyl nalezen')
        return
      }
      openPlanningEditor(course, true)
      return
    }

    closePlanningEditor()

    try {
      await updateCourse(courseId, { status: newStatus }, orgSlug)
      if (queryClient) {
        await invalidateCourseQueries(queryClient, courseId)
      }
      toast.success(statusMessages[newStatus])
    } catch {
      toast.error('Nepodařilo se změnit stav kurzu')
    }
  }

  return {
    // State
    planningCourseId,
    planningDateTime,
    planningNeedsStatusUpdate,
    planningError,
    planningSaving,
    planningIsEditing,
    // Setters
    setPlanningDateTime,
    setPlanningError,
    // Actions
    closePlanningEditor,
    openPlanningEditor,
    handlePlanningConfirm,
    // Helpers
    createPlanningState,
    handleStatusChange,
  }
}
