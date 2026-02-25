import type { CourseDetail } from '@/lib/schemas'
import { useOutletContext } from 'react-router-dom'

export type UserCourseLayoutContext = {
  courseId: string
  courseData: CourseDetail
  activeModules: CourseDetail['modules']
  isConnected: boolean
}

export const useUserCourseLayoutContext = () =>
  useOutletContext<UserCourseLayoutContext>()

