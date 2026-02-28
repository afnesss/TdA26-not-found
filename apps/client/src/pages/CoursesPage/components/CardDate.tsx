import { Calendar } from 'lucide-react'
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
  course: CourseSummary
  isDraft?: boolean
  state?: CourseStatus
  planning?: CoursePlanningState
  hideStatusLabel?: boolean
}

const CardDate = ({
  course,
  isDraft,
  state = 'draft',
  planning,
  hideStatusLabel = false,
}: CardDateProps) => {
  const getStatusLabel = () => {
    if (planning?.isEditing) return
    switch (state) {
      case 'draft':
        return 'Vytvořeno'
      case 'planned':
        return 'Začíná'
      case 'live':
        return 'Běží od'
      case 'paused':
        return 'Pozastaveno'
      case 'archived':
        return 'Dokončeno'
      default:
        return 'Vytvořeno'
    }
  }

  const getDateToDisplay = () => {
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

  return (
    <div className='flex flex-col gap-1'>
      {!hideStatusLabel && (
        <span className='text-xs text-gray-500'>
          {isDraft ? 'Nový kurz' : getStatusLabel()}
        </span>
      )}

      {planning?.isEditing ? (
        <div
          className='space-y-1 flex'
          onClick={(e) => e.stopPropagation()}
          role='group'
          aria-label='Upravit datum a čas'
        >
          <input
            type='datetime-local'
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
