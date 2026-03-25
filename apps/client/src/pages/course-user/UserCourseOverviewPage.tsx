import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import SummarySection from '../CoursePage/components/SummarySection'
import { useNavigate } from 'react-router-dom'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'

const UserCourseOverviewPage = () => {
  const navigate = useNavigate()
  const { courseId, courseData, activeModules } = useUserCourseLayoutContext()

  return (
    <div className='space-y-5'>
      <SummarySection
        name={courseData.name}
        description={courseData.description ?? undefined}
        breadcrumbs={[
          { label: 'Kurzy', path: '/courses' },
          { label: courseData.name },
        ]}
      />

      <section>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='font-bold mb-3'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Aktivní moduly
            </UnderlinedText>
          </Label>
        </div>

        {activeModules.length === 0 ? (
          <StateComp
            type='no-content'
            message='Kurz zatím nemá žádné aktivní moduly'
            className='pt-8 pb-0'
          />
        ) : (
          <CourseModulesGrid
            modules={activeModules}
            courseStatus={courseData.status}
            onOpenModule={(moduleId) =>
              navigate(`/courses/${courseId}/modules/${moduleId}`)
            }
            userMode
          />
        )}
      </section>
    </div>
  )
}

export default UserCourseOverviewPage

