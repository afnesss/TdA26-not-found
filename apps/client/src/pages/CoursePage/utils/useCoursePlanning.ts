import { useState } from 'react'
import i18n from '@/i18n'
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
      const message = i18n.t('toasts.course.planningSelectDateTime', {
        ns: 'dashboard',
      })
      setPlanningError(message)
      toast.error(message)
      return
    }

    const selectedDate = new Date(planningDateTime)
    if (Number.isNaN(selectedDate.getTime())) {
      const message = i18n.t('toasts.course.planningInvalidDateFormat', {
        ns: 'dashboard',
      })
      setPlanningError(message)
      toast.error(message)
      return
    }

    const now = new Date()
    if (selectedDate <= now) {
      const message = i18n.t('toasts.course.planningDateMustBeFuture', {
        ns: 'dashboard',
      })
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
          ? i18n.t('toasts.course.planned', { ns: 'dashboard' })
          : i18n.t('toasts.course.rescheduled', { ns: 'dashboard' }),
      )

      onSuccess?.()
      closePlanningEditor()
    } catch {
      toast.error(i18n.t('toasts.course.planningSaveError', { ns: 'dashboard' }))
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
      draft: i18n.t('courseOverview.statusChanged.draft', { ns: 'dashboard' }),
      planned: i18n.t('courseOverview.statusChanged.planned', { ns: 'dashboard' }),
      live: i18n.t('courseOverview.statusChanged.live', { ns: 'dashboard' }),
      paused: i18n.t('courseOverview.statusChanged.paused', { ns: 'dashboard' }),
      archived: i18n.t('courseOverview.statusChanged.archived', {
        ns: 'dashboard',
      }),
    }

    if (newStatus === 'planned') {
      const course = courses?.find((c) => c.uuid === courseId)
      if (!course) {
        toast.error(i18n.t('toasts.course.notFound', { ns: 'dashboard' }))
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
      toast.error(
        i18n.t('toasts.course.statusChangeSaveError', { ns: 'dashboard' }),
      )
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
