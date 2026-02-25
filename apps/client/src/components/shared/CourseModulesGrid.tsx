import type { CourseDetail } from '@/lib/schemas'
import type { CourseModule, CourseModulesStatus } from '@/lib/schemas/module'
import ModuleCard from '@/pages/dashboard/components/ModuleCard'

type CourseModulesGridProps = {
  modules: CourseModule[]
  courseStatus: CourseDetail['status']
  onOpenModule: (moduleId: string) => void
  canToggleModuleVisibility?: boolean
  isToggleVisibilityPending?: boolean
  onDeleteModule?: (moduleId: string) => void
  onToggleModuleVisibility?: (
    moduleId: string,
    currentStatus: CourseModulesStatus,
  ) => void
}

const CourseModulesGrid = ({
  modules,
  courseStatus,
  onOpenModule,
  canToggleModuleVisibility,
  isToggleVisibilityPending,
  onDeleteModule,
  onToggleModuleVisibility,
}: CourseModulesGridProps) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {modules.map((module, index) => (
        <ModuleCard
          key={module.uuid}
          variant='existing'
          module={module}
          moduleIndex={index + 1}
          courseStatus={courseStatus}
          canToggleModuleVisibility={canToggleModuleVisibility}
          isToggleVisibilityPending={isToggleVisibilityPending}
          onOpenModule={onOpenModule}
          onDeleteModule={onDeleteModule}
          onToggleModuleVisibility={onToggleModuleVisibility}
        />
      ))}
    </div>
  )
}

export default CourseModulesGrid
