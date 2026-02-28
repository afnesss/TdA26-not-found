import type { ModuleDetail } from '@/lib/schemas/module'
import type { CourseDetail } from '@/lib/schemas'
import ModuleCard from './ModuleCard'

interface DragOverlayComponentProps {
  module: ModuleDetail
  moduleIndex: number
}

export default function DragOverlayComponent({
  module,
  moduleIndex,
}: DragOverlayComponentProps) {
  return (
    <ModuleCard
      variant='existing'
      module={module}
      moduleIndex={moduleIndex}
      courseStatus={'draft' as CourseDetail['status']}
      showGripHandle
      alwaysShowActions={false}
      onOpenModule={() => {}}
      isDragging
    />
  )
}
