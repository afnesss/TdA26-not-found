import type { CourseDetail } from '@/lib/schemas'
import type { CourseModule, CourseModulesStatus } from '@/lib/schemas/module'
import ModuleCard from '@/pages/dashboard/components/ModuleCard'
import type { DraggableModuleCard } from '@/pages/dashboard/components/DraggableModuleCard'

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
  canDragAndDrop?: boolean
  DraggableCardComponent?: typeof DraggableModuleCard
  lastActiveModuleUuid?: string
  userMode?: boolean
}

const CourseModulesGrid = ({
  modules,
  courseStatus,
  onOpenModule,
  canToggleModuleVisibility,
  isToggleVisibilityPending,
  onDeleteModule,
  onToggleModuleVisibility,
  canDragAndDrop,
  DraggableCardComponent,
  lastActiveModuleUuid,
  userMode,
}: CourseModulesGridProps) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {modules.map((module, index) => {
        const commonProps = {
          module,
          moduleIndex: index + 1,
          courseStatus,
          onOpenModule,
          canToggleModuleVisibility,
          isToggleVisibilityPending,
          onDeleteModule,
          onToggleModuleVisibility,
          lastActiveModuleUuid,
          userMode,
        }

        if (canDragAndDrop && DraggableCardComponent) {
          return (
            <DraggableCardComponent
              key={module.uuid}
              {...commonProps}
            />
          )
        }

        return <ModuleCard key={module.uuid} variant='existing' {...commonProps} />
      })}
    </div>
  )
}

export default CourseModulesGrid
