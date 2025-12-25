import { Calendar } from "lucide-react"
import type { CoursesSummary } from "@/lib/types"
type CardDateProps ={
  course: CoursesSummary,
  getTime: (date: string) => string;
}
const CardDate = ({course, getTime}:CardDateProps) => {
  return (
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1.5'>
          <Calendar size={14} className='text-primary' />
          <span>
            {new Date(course.createdAt).toLocaleDateString('cs-CZ', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <span className='text-xs text-gray-400'>
          Aktualizováno {getTime(course.updatedAt)}
        </span>
      </div>
  )
}

export default CardDate
