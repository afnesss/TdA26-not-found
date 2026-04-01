import { ListChecks } from 'lucide-react'

type CourseQuizCountBadgeProps = {
  totalQuizzes: number
}

const CourseQuizCountBadge = ({ totalQuizzes }: CourseQuizCountBadgeProps) => {
  return (
    <div className='inline-flex items-center  rounded-2xl bg-background px-3 py-1.5 text-primary'>
      <p className='text-sm font-semibold '>
        Kvízy v kurzu: {<span className='ml-2'> {totalQuizzes}</span>}
      </p>
    </div>
  )
}

export default CourseQuizCountBadge
