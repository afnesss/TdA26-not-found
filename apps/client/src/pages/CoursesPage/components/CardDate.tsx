import { Calendar } from 'lucide-react'
import type { CourseSummary } from '@/lib/schemas/course'

type CardDateProps = {
  course: CourseSummary
  getTime: (date: string) => string
  isDraft?: boolean
}
const CardDate = ({ course, getTime, isDraft }: CardDateProps) => {
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-1.5'>
        <Calendar size={14} className='text-primary' />
        <span>
          {new Date(course.createdAt).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      {isDraft ? (
        <span className='text-xs text-gray-400'>Nový kurz</span>
      ) : (
        <span className='text-xs text-gray-400'>
          Aktualizováno{' '}
          {getTime(
            typeof course.updatedAt === 'string'
              ? course.updatedAt
              : course.updatedAt.toISOString(),
          )}
        </span>
      )}
    </div>
  )
}

export default CardDate
