type CourseQuizCountBadgeProps = {
  totalQuizzes: number
  label?: string
}

const CourseQuizCountBadge = ({
  totalQuizzes,
  label = 'Kvízy v kurzu:',
}: CourseQuizCountBadgeProps) => {
  return (
    <div className='inline-flex items-center rounded-2xl bg-background px-3 py-1.5 text-primary'>
      <p className='text-sm font-semibold'>
        {label}
        <span className='ml-2'>{totalQuizzes}</span>
      </p>
    </div>
  )
}

export default CourseQuizCountBadge
