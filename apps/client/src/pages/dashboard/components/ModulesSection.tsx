import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import type { ModuleDetail } from '@/lib/schemas/module'
import type { CourseStatus } from '@/components/shared/CourseStateBadge'
import DashboardAddButton from './DashboardAddButton'
import ModuleCard, { type DraftModuleForm } from './ModuleCard'

interface ModulesSectionProps {
  modules: ModuleDetail[]
  courseStatus: CourseStatus
  draftModule: DraftModuleForm | null
  setDraftModule: React.Dispatch<React.SetStateAction<DraftModuleForm | null>>
  previewMode: boolean
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
}

const ModulesSection = ({
  modules,
  courseStatus,
  draftModule,
  setDraftModule,
  previewMode,
  onAddModule,
  onOpenModule,
  onCreateModule,
  onDeleteModule,
  onToggleVisibility,
  isCreating,
  isToggleVisibilityPending,
}: ModulesSectionProps) => {
  const modulesList = modules
  const canToggleModuleVisibility =
    courseStatus === 'draft' || courseStatus === 'live'

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

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Label className='font-bold text-lg md:text-xl text-neutral-black'>
          <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
            Moduly kurzu
          </UnderlinedText>
        </Label>

        {!previewMode && (
          <DashboardAddButton
            label='Přidat modul'
            className='rounded-full'
            onClick={onAddModule}
            disabled={Boolean(draftModule)}
          />
        )}
      </div>

      {isEmpty ? (
        <StateComp
          type='no-content'
          message='Kurz zatím nemá žádné moduly'
          className='pt-8'
        />
      ) : (
        <div className='space-y-4'>
          {modulesForGrid.length > 0 && (
            <CourseModulesGrid
              modules={modulesForGrid}
              courseStatus={courseStatus}
              onOpenModule={onOpenModule}
              canToggleModuleVisibility={canToggleModuleVisibility}
              isToggleVisibilityPending={isToggleVisibilityPending}
              onDeleteModule={onDeleteModule}
              onToggleModuleVisibility={onToggleVisibility}
            />
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
                onDeleteModule={onDeleteModule}
                onToggleModuleVisibility={onToggleVisibility}
              />

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
