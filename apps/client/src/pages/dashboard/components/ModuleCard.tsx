import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import ModuleVisibilityActionButton from './ModuleVisibilityActionButton'
import EditBtn from './EditBtn'
import { Edit } from 'lucide-react'
import DeleteConfirmDialog from '@/components/ui/AlertDialog'
import { Card, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { handleCapitalizedInput } from '@/lib/capitalize'
import EditSaveCancelButtons from '@/components/shared/EditSaveCancelButtons'
import type { CourseModule, CourseModulesStatus } from '@/lib/schemas/module'
import type { CourseDetail } from '@/lib/schemas'
import { Label } from '@/components/ui/label'
import { truncateDescription } from '../../CoursePage/utils/helperFunctions'

export type DraftModuleForm = {
  name: string
  description: string
}

type BaseModuleCardProps = {
  moduleIndex: number
}

type ExistingModuleCardProps = BaseModuleCardProps & {
  variant: 'existing'
  module: CourseModule
  courseStatus: CourseDetail['status']
  canToggleModuleVisibility?: boolean
  isToggleVisibilityPending?: boolean
  onOpenModule: (moduleId: string) => void
  onDeleteModule?: (moduleId: string) => void
  onToggleModuleVisibility?: (
    moduleId: string,
    currentStatus: CourseModulesStatus,
  ) => void
}

type DraftModuleCardProps = BaseModuleCardProps & {
  variant: 'draft'
  draftModule: DraftModuleForm
  setDraftModule: React.Dispatch<React.SetStateAction<DraftModuleForm | null>>
  onCreate: () => void
  onCancel: () => void
  isCreating: boolean
}

type ModuleCardProps = ExistingModuleCardProps | DraftModuleCardProps

const ModuleCard = (props: ModuleCardProps) => {
  if (props.variant === 'draft') {
    const {
      moduleIndex,
      draftModule,
      setDraftModule,
      onCreate,
      onCancel,
      isCreating,
    } = props

    return (
      <Card className='border border-border/60 shadow-md bg-background'>
        <div className='p-3 md:px-5 md:py-4 h-full flex flex-col gap-2'>
          <div className='min-w-0 flex items-center gap-2 '>
            <span className='inline-flex items-center justify-center w-6 h-6 rounded-full text-foreground font-medium shrink-0 bg-primary/20'>
              {moduleIndex}
            </span>
            <Textarea
              minRows={1}
              maxRows={2}
              value={draftModule.name}
              onChange={(e) =>
                setDraftModule((prev) =>
                  prev
                    ? {
                        ...prev,
                        name: handleCapitalizedInput(e.target.value, prev.name),
                      }
                    : prev,
                )
              }
              placeholder='Zadejte název modulu'
              className='placeholder:font-semibold'
            />
            <EditSaveCancelButtons
              onSave={() => onCreate()}
              onCancel={() => onCancel()}
              saveDisabled={isCreating || !draftModule.name.trim()}
              cancelDisabled={isCreating}
              saveAriaLabel='Create module'
              cancelAriaLabel='Cancel module draft'
              className='flex items-center gap-1'
            />
          </div>

          <div className='space-y-1'>
            <div>
              <Textarea
                minRows={1}
                maxRows={4}
                value={draftModule.description}
                onChange={(e) =>
                  setDraftModule((prev) =>
                    prev
                      ? {
                          ...prev,
                          description: handleCapitalizedInput(
                            e.target.value,
                            prev.description,
                          ),
                        }
                      : prev,
                  )
                }
                placeholder='Popis modulu (volitelné)'
              />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const {
    module,
    moduleIndex,
    courseStatus,
    canToggleModuleVisibility,
    isToggleVisibilityPending,
    onOpenModule,
    onDeleteModule,
    onToggleModuleVisibility,
  } = props

  return (
    <Card
      className='border border-border/60 shadow-md bg-background cursor-pointer'
      onClick={() => onOpenModule(module.uuid)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenModule(module.uuid)
        }
      }}
    >
      <div className='p-3 md:px-5 md:py-4 h-full flex flex-col'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0 flex items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded-full text-foreground font-medium shrink-0',
                courseStatus !== 'live'
                  ? 'bg-primary/30'
                  : module.status === 'active'
                    ? 'bg-secondary/60'
                    : 'bg-muted-foreground/20',
              )}
            >
              {moduleIndex}
            </span>
            <Label className='font-bold min-w-0' size='md'>
              <span className='block truncate'>{module.name}</span>
            </Label>
          </div>

          {courseStatus === 'draft' && onDeleteModule ? (
            <div className='flex shrink-0 items-center gap-2'>
              <EditBtn
                icon={Edit}
                onClick={(e) => {
                  e?.stopPropagation()
                  onOpenModule(module.uuid)
                }}
                aria-label={`Edit module ${module.name}`}
              />
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteConfirmDialog
                  itemType='modul'
                  itemName={module.name}
                  trigger={
                    <EditBtn
                      type='delete'
                      aria-label={`Delete module ${module.name}`}
                    />
                  }
                  onConfirm={() => {
                    onDeleteModule(module.uuid)
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <CardDescription className='w-full mt-1 mb-2 md:mb-3'>
          {truncateDescription(module.description ?? '')}
        </CardDescription>

        <div className='flex justify-between gap-3 pt-2 border-t border-border/60'>
          <div className='text-xs md:text-sm flex flex-wrap gap-2 sm:gap-5 items-center'>
            <p className='text-muted-foreground'>
              Materiály:{' '}
              <span className='font-semibold text-neutral-black'>
                {module.materials.length}
              </span>
            </p>
            <p className='text-muted-foreground'>
              Kvízy:{' '}
              <span className='font-semibold text-neutral-black'>
                {module.quizzes.length}
              </span>
            </p>
            {module.updatedAt && module.updatedAt !== module.createdAt && (
              <span className='text-[10px] md:text-xs text-muted-foreground/60 italic'>
                upraveno{' '}
                {new Date(String(module.updatedAt)).toLocaleDateString('cs-CZ')}
              </span>
            )}
          </div>
          <div className='flex flex-col items-end gap-2'>
            <div className='flex shrink-0 items-center gap-2'>
              {courseStatus !== 'draft' && (
                <Button
                  variant={'grid'}
                  size={'sm'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenModule(module.uuid)
                  }}
                  className={cn(
                    'bg-linear-to-br h-8 text-xs md:text-sm',
                    colorStyles.bg['accent-teal-dark'],
                    colorStyles.text['accent-teal-dark'],
                  )}
                >
                  <span className='font-semibold'>Zobrazit</span>
                </Button>
              )}
              {canToggleModuleVisibility && onToggleModuleVisibility && (
                <ModuleVisibilityActionButton
                  status={module.status}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleModuleVisibility(module.uuid, module.status)
                  }}
                  disabled={Boolean(isToggleVisibilityPending)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ModuleCard
