import { colorStyles } from '@/lib/constants'
import type { CourseDetail } from '@/lib/schemas'
import { useOutletContext } from 'react-router-dom'

export type CourseModulesLayoutContext = {
  courseId: string
  courseMeta: Pick<
    CourseDetail,
    | 'uuid'
    | 'name'
    | 'description'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
    | 'status_history'
  >
  previewMode: boolean
}

export const useCourseModulesLayoutContext = () =>
  useOutletContext<CourseModulesLayoutContext>()
