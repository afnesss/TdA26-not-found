import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CourseStatus, CourseSummary } from '@/lib/schemas/course'
import { formatDateWithToday } from '@/pages/CoursePage/utils/helperFunctions'

export type CoursePlanningState = {
  editable: boolean
  isEditing: boolean
  value: string
  error: string
  saving: boolean
  onOpen: () => void
  onChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

type CardDateProps = {
  course?: CourseSummary
  isDraft?: boolean
  state?: CourseStatus
  planning?: CoursePlanningState
  hideStatusLabel?: boolean
  label?: string
  date?: string
}

const CardDate = ({
  course,
  isDraft,
  state = 'draft',
  planning,
  hideStatusLabel = false,
  label,
  date,
}: CardDateProps) => {
  const { t } = useTranslation(['common', 'dashboard'])

  const getStatusLabel = () => {
    if (label) return label
    if (planning?.isEditing) return
    switch (state) {
      case 'draft':
        return t('courseDate.created', { ns: 'common' })
      case 'planned':
        return t('courseDate.starts', { ns: 'common' })
      case 'live':
        return t('courseDate.runningSince', { ns: 'common' })
      case 'paused':
        return t('courseDate.paused', { ns: 'common' })
      case 'archived':
        return t('courseDate.completed', { ns: 'common' })
      default:
        return t('courseDate.created', { ns: 'common' })
    }
  }

  const getDateToDisplay = () => {
    if (date) return date
    if (!course) return ''
    const showTime =
      state === 'planned' || state === 'live' || state === 'paused'

    let dateTime: string | Date | undefined = course.createdAt
    switch (state) {
      case 'live':
        dateTime = course.startedAt || course.createdAt
        break
      case 'planned':
        dateTime = course.scheduledFor || course.createdAt
        break
      case 'paused': {
        const history = Array.isArray(course.status_history)
          ? course.status_history
          : []
        const lastPaused = [...history]
          .reverse()
          .find((e) => e.status === 'paused')
        dateTime = lastPaused?.timestamp || course.updatedAt || course.createdAt
        break
      }
      case 'archived': {
        const history = Array.isArray(course.status_history)
          ? course.status_history
          : []
        const lastArchived = [...history]
          .reverse()
          .find((e) => e.status === 'archived')
        dateTime =
          lastArchived?.timestamp || course.updatedAt || course.createdAt
        break
      }
      default:
        dateTime = course.createdAt
    }

    return formatDateWithToday(
      typeof dateTime === 'string'
        ? dateTime
        : dateTime
          ? dateTime.toISOString()
          : '',
      showTime,
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='flex flex-col gap-1'>
      {!hideStatusLabel && (
        <span className='text-xs text-gray-500'>
          {isDraft ? t('courseDate.newCourse', { ns: 'common' }) : getStatusLabel()}
        </span>
      )}

      {planning?.isEditing ? (
        <div
          className='space-y-1 flex'
          onClick={(e) => e.stopPropagation()}
          role='group'
          aria-label={t('courseOverview.planning.editDateTimeAria', {
            ns: 'dashboard',
          })}
        >
          <input
            type='datetime-local'
            min={today}
            value={planning.value}
            onChange={(e) => planning.onChange(e.target.value)}
            className='h-8 rounded-md border border-input bg-background px-2 text-xs md:text-sm '
            disabled={planning.saving}
          />
        </div>
      ) : (
        <div className='flex items-center gap-1.5 mr-3 shrink-0'>
          <Calendar size={14} className='text-primary ' />
          {planning?.editable ? (
            <button
              type='button'
              className='text-xs md:text-sm font-medium hover:underline cursor-pointer '
              onClick={(e) => {
                e.stopPropagation()
                planning.onOpen()
              }}
            >
              {getDateToDisplay()}
            </button>
          ) : (
            <span className='text-xs md:text-sm font-medium shrink-0'>
              {getDateToDisplay()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default CardDate
