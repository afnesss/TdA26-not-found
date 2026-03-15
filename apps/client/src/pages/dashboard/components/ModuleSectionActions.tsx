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
}: ModulesSectionActionsProps) => (
  <div className='flex items-center gap-2'>
    {headerRightSlot}
    {courseStatus === 'draft' && !previewMode && (
      <Button
        variant={'outline'}
        size='sm'
        disabled={modulesLength === 0 || disableActions}
        onClick={() => {
          if (!disableActions) onToggleReorderMode()
        }}
        className='rounded-full'
      >
        {isReorderMode ? (
          <>
            <X className='w-4 h-4' />
            Zrušit
          </>
        ) : (
          <>
            <Menu className='w-4 h-4' />
            Přeskládat
          </>
        )}
      </Button>
    )}
    {!previewMode && (
      <DashboardAddButton
        label='Přidat modul'
        className='rounded-full'
        onClick={() => {
          if (!disableActions) onAddModule()
        }}
        disabled={Boolean(draftModule) || isReorderMode || disableActions}
      />
    )}
  </div>
)
