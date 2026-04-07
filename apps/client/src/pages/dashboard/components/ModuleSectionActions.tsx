import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import DashboardAddButton from './DashboardAddButton'
import type { CourseStatus } from '@/lib/schemas'
import type { DraftModuleForm } from './ModuleCard'
import type { ReactNode } from 'react'

type ModulesSectionActionsProps = {
  courseStatus: CourseStatus
  previewMode: boolean
  modulesLength: number
  disableActions?: boolean
  isReorderMode: boolean
  draftModule: DraftModuleForm | null
  onToggleReorderMode: () => void
  onAddModule: () => void
  headerRightSlot?: ReactNode
  labels?: {
    cancelReorder?: string
    reorder?: string
    addModule?: string
  }
}

export const ModulesSectionActions = ({
  courseStatus,
  previewMode,
  modulesLength,
  disableActions = false,
  isReorderMode,
  draftModule,
  onToggleReorderMode,
  onAddModule,
  headerRightSlot,
  labels,
}: ModulesSectionActionsProps) => (
  <div className='flex items-center gap-2'>
    {headerRightSlot}
    {courseStatus === 'draft' && !previewMode && (
      <Button
        variant='outline'
        size='sm'
        disabled={modulesLength < 2 || disableActions}
        onClick={() => {
          if (!disableActions) onToggleReorderMode()
        }}
        className='rounded-full'
        aria-label={
          isReorderMode
            ? labels?.cancelReorder ?? 'Zrušit přeskládání'
            : labels?.reorder ?? 'Přeskládat'
        }
      >
        {isReorderMode ? (
          <>
            <X className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {labels?.cancelReorder ?? 'Zrušit'}
            </span>
          </>
        ) : (
          <>
            <Menu className='w-4 h-4' />
            <span className='hidden sm:inline'>
              {labels?.reorder ?? 'Přeskládat'}
            </span>
          </>
        )}
      </Button>
    )}
    {!previewMode && (
      <DashboardAddButton
        label={labels?.addModule ?? 'Přidat modul'}
        className='rounded-full'
        onClick={() => {
          if (!disableActions) onAddModule()
        }}
        disabled={Boolean(draftModule) || isReorderMode || disableActions}
      />
    )}
  </div>
)
