import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ModuleDetail } from '@/lib/schemas/module'
import type { CourseStatus } from '@/components/shared/CourseStateBadge'
import { Menu, X } from 'lucide-react'
import DashboardAddButton from './DashboardAddButton'
import ModuleCard, { type DraftModuleForm } from './ModuleCard'
import { DragDropModulesProvider } from './DragDropModulesProvider'
import { DraggableModuleCard } from './DraggableModuleCard'
import { useEffect, useRef } from 'react'

interface ModulesSectionProps {
  courseId: string
  modules: ModuleDetail[]
  courseStatus: CourseStatus
  draftModule: DraftModuleForm | null
  setDraftModule: React.Dispatch<React.SetStateAction<DraftModuleForm | null>>
  previewMode: boolean
  isReorderMode: boolean
  disableActions?: boolean
  onToggleReorderMode: () => void
  onAddModule: () => void
  onOpenModule: (moduleId: string) => void
  onCreateModule: () => void
  onDeleteModule: (moduleId: string) => void
  onToggleVisibility: (
    moduleId: string,
    currentStatus: 'active' | 'passive',
  ) => void
  isCreating: boolean
  isToggleVisibilityPending: boolean
  lastActiveModuleUuid?: string
}

const ModulesSection = ({
  courseId,
  modules,
  courseStatus,
  draftModule,
  setDraftModule,
  previewMode,
  isReorderMode,
  disableActions = false,
  onToggleReorderMode,
  onAddModule,
  onOpenModule,
  onCreateModule,
  onDeleteModule,
  onToggleVisibility,
  isCreating,
  isToggleVisibilityPending,
  lastActiveModuleUuid,
}: ModulesSectionProps) => {
  const modulesList = modules
  const canToggleModuleVisibility = courseStatus === 'live'

  const shouldPlaceDraftInExistingLastRow =
    Boolean(draftModule) &&
    modulesList.length > 0 &&
    modulesList.length % 2 === 1

  const modulesForGrid = shouldPlaceDraftInExistingLastRow
    ? modulesList.slice(0, -1)
    : modulesList

  const lastModule = shouldPlaceDraftInExistingLastRow
    ? modulesList[modulesList.length - 1]
    : null

  const isEmpty = modulesList.length === 0 && !draftModule

  const canDragAndDrop =
    courseStatus === 'draft' && isReorderMode && modulesList.length > 1

  const draftCardRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!draftModule || !draftCardRef.current) return
    const rect = draftCardRef.current.getBoundingClientRect()
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight

    if (!isVisible) {
      draftCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [draftModule])

  return (
    <section className='space-y-4'>
      {isEmpty ? (
        <StateComp
          type='no-content'
          message='Kurz zatím nemá žádné moduly'
          className='py-8'
        />
      ) : (
        <div className='space-y-4'>
          {modulesForGrid.length > 0 && (
            <DragDropModulesProvider
              courseId={courseId!}
              modules={modulesForGrid}
            >
              {(orderedModules) => (
                <CourseModulesGrid
                  modules={orderedModules}
                  courseStatus={courseStatus}
                  onOpenModule={onOpenModule}
                  canToggleModuleVisibility={canToggleModuleVisibility}
                  isToggleVisibilityPending={isToggleVisibilityPending}
                  onDeleteModule={isReorderMode ? undefined : onDeleteModule}
                  onToggleModuleVisibility={onToggleVisibility}
                  lastActiveModuleUuid={lastActiveModuleUuid}
                  canDragAndDrop={canDragAndDrop}
                  DraggableCardComponent={DraggableModuleCard}
                />
              )}
            </DragDropModulesProvider>
          )}

          {lastModule && draftModule && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <ModuleCard
                variant='existing'
                module={lastModule}
                moduleIndex={modulesList.length}
                courseStatus={courseStatus}
                canToggleModuleVisibility={canToggleModuleVisibility}
                isToggleVisibilityPending={isToggleVisibilityPending}
                onOpenModule={onOpenModule}
                onDeleteModule={isReorderMode ? undefined : onDeleteModule}
                onToggleModuleVisibility={onToggleVisibility}
                lastActiveModuleUuid={lastActiveModuleUuid}
              />

              <div ref={draftCardRef}>
                <ModuleCard
                  variant='draft'
                  moduleIndex={modulesList.length + 1}
                  draftModule={draftModule}
                  setDraftModule={setDraftModule}
                  onCreate={onCreateModule}
                  onCancel={() => setDraftModule(null)}
                  isCreating={isCreating}
                />
              </div>
            </div>
          )}

          {draftModule && !lastModule && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <ModuleCard
                variant='draft'
                moduleIndex={modulesList.length + 1}
                draftModule={draftModule}
                setDraftModule={setDraftModule}
                onCreate={onCreateModule}
                onCancel={() => setDraftModule(null)}
                isCreating={isCreating}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default ModulesSection
