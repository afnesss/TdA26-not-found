import { colorStyles } from '@/lib/constants'
import type { CourseDetail } from '@/lib/schemas'
import type { ModuleDetail } from '@/lib/schemas/module'
import { useOutletContext } from 'react-router-dom'

export type CourseModulesLayoutContext = {
  courseId: string
  course: CourseDetail | null
  modules?: ModuleDetail[]
  isConnected: boolean
  isLoading: boolean
  isError: boolean
  refetchCourse: () => void
  previewMode: boolean
  courseIndexColor: keyof typeof colorStyles.line
}

export const useCourseModulesLayoutContext = () =>
  useOutletContext<CourseModulesLayoutContext>()
