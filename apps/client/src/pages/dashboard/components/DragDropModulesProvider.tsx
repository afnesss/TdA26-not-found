import type { ModuleDetail } from '@/lib/schemas/module'
import { useReorderModulesMutation } from '@/pages/CoursePage/utils/useModuleMutation'
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import DragOverlayComponent from './DragOverlayComponent'

interface DragDropModulesProviderProps {
  courseId: string
  modules: ModuleDetail[]
  children: (orderedModules: ModuleDetail[]) => React.ReactNode
}

const dropAnimation: DropAnimation = {
  duration: 160,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
}

export function DragDropModulesProvider({
  courseId,
  modules,
  children,
}: DragDropModulesProviderProps) {
  const [activeModule, setActiveModule] = useState<ModuleDetail | null>(null)
  const [dragItems, setDragItems] = useState<string[] | null>(null)
  const { mutate: reorderModulesMutation } = useReorderModulesMutation(courseId)
  const baseItems = useMemo(() => modules.map((m) => m.uuid), [modules])
  const items = dragItems ?? baseItems

  const modulesById = useMemo(
    () => new Map(modules.map((module) => [module.uuid, module])),
    [modules],
  )

  const orderedModules = useMemo(
    () =>
      items
        .map((id) => modulesById.get(id))
        .filter((module): module is ModuleDetail => Boolean(module)),
    [items, modulesById],
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setDragItems(baseItems)
    const module = modulesById.get(event.active.id as string)
    setActiveModule(module ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId !== overId) {
      setDragItems((prev) => {
        const currentItems = prev ?? baseItems
        const oldIndex = currentItems.indexOf(activeId)
        const newIndex = currentItems.indexOf(overId)

        if (oldIndex === -1 || newIndex === -1) return prev

        return arrayMove(currentItems, oldIndex, newIndex)
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    setActiveModule(null)

    if (!over) {
      setDragItems(null)
      return
    }

    const originalOrder = baseItems
    const hasOrderChanged =
      originalOrder.length !== items.length ||
      originalOrder.some((id, index) => id !== items[index])

    if (!hasOrderChanged) {
      setDragItems(null)
      return
    }

    reorderModulesMutation(
      { moduleIds: items },
      {
        onSettled: () => {
          setDragItems(null)
        },
      },
    )
  }

  const handleDragCancel = () => {
    setActiveModule(null)
    setDragItems(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {children(orderedModules)}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeModule && (
          <DragOverlayComponent
            module={activeModule}
            moduleIndex={
              modules.findIndex((m) => m.uuid === activeModule.uuid) + 1
            }
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
