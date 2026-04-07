import { useTranslation } from 'react-i18next'

type CourseQuizCountBadgeProps = {
  totalQuizzes: number
  label?: string
}

const CourseQuizCountBadge = ({
  totalQuizzes,
  label,
}: CourseQuizCountBadgeProps) => {
  const { t } = useTranslation('dashboard')
  const resolvedLabel = label ?? t('courseOverview.leaderboard.quizzesInCourse')

  return (
    <div className='inline-flex items-center rounded-2xl bg-background px-3 py-1.5 text-primary'>
      <p className='text-sm font-semibold'>
        {resolvedLabel}
        <span className='ml-2'>{totalQuizzes}</span>
      </p>
    </div>
  )
}

export default CourseQuizCountBadge
