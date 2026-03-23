import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import ModuleCard from './ModuleCard'
import type { CourseModule } from '@/lib/schemas/module'
import type { CourseDetail } from '@/lib/schemas'
import { useEffect, useRef, useState } from 'react'

interface DraggableModuleCardProps {
  module: CourseModule
  moduleIndex: number
  courseStatus: CourseDetail['status']
  canToggleModuleVisibility?: boolean
  isToggleVisibilityPending?: boolean
  onOpenModule: (moduleId: string) => void
  onDeleteModule?: (moduleId: string) => void
  onToggleModuleVisibility?: (
    moduleId: string,
    currentStatus: 'active' | 'passive',
  ) => void
  lastActiveModuleUuid?: string
  firstPassiveModuleUuid?: string
}

export function DraggableModuleCard({
  module,
  moduleIndex,
  courseStatus,
  ...rest
}: DraggableModuleCardProps) {
  const [cardHeight, setCardHeight] = useState<number | null>(null)
  const cardContentRef = useRef<HTMLDivElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.uuid })

  useEffect(() => {
    if (isDragging || !cardContentRef.current) return

    setCardHeight(cardContentRef.current.offsetHeight)
  }, [isDragging, module, moduleIndex])

  const style = {
    transform: CSS.Transform.toString(
      transform
        ? {
            ...transform,
            scaleX: isDragging ? 1.02 : transform.scaleX,
            scaleY: isDragging ? 1.02 : transform.scaleY,
          }
        : null,
    ),
    transition:
      transition ??
      'transform 160ms cubic-bezier(0.2, 0, 0, 1), box-shadow 160ms ease-out',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative will-change-transform', isDragging && 'z-50')}
    >
      {isDragging ? (
        <div
          aria-hidden='true'
          className='pointer-events-none'
          style={{ height: cardHeight ?? undefined }}
        />
      ) : (
        <div ref={cardContentRef}>
          <ModuleCard
            variant='existing'
            module={module}
            moduleIndex={moduleIndex}
            courseStatus={courseStatus}
            showGripHandle
            alwaysShowActions={false}
            gripHandleProps={{ attributes, listeners }}
            {...rest}
          />
        </div>
      )}
    </div>
  )
}
