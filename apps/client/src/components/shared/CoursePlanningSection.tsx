import type { ReactNode } from 'react'
import type { CourseStatus, CourseSummary } from '@/lib/schemas/course'
import { cn } from '@/lib/utils'
import CardDate, {
  type CoursePlanningState,
} from '@/pages/CoursesPage/components/CardDate'
import EditSaveCancelButtons from './EditSaveCancelButtons'

type CoursePlanningSectionProps = {
  course: CourseSummary
  state: CourseStatus
  isDraft?: boolean
  planning?: CoursePlanningState
  hideStatusLabel?: boolean
  rightActions?: ReactNode
  className?: string
  rowClassName?: string
}

const CoursePlanningSection = ({
  course,
  state,
  isDraft,
  planning,
  hideStatusLabel,
  rightActions,
  className,
  rowClassName,
}: CoursePlanningSectionProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex justify-between w-full items-center gap-2',
          rowClassName,
        )}
      >
        <CardDate
          course={course}
          isDraft={isDraft}
          state={state}
          planning={planning}
          hideStatusLabel={hideStatusLabel}
        />

        {planning?.isEditing ? (
          <EditSaveCancelButtons
            className='flex gap-2 items-end'
            onSave={() => planning.onConfirm()}
            onCancel={() => planning.onCancel()}
            saveDisabled={planning.saving || !!planning.error}
            cancelDisabled={planning.saving}
            saveAriaLabel='Save course'
          />
        ) : (
          rightActions
        )}
      </div>

    </div>
  )
}

export default CoursePlanningSection
