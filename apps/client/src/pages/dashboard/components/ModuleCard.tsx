import { Button } from '@/components/ui/button'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import ModuleVisibilityActionButton from './ModuleVisibilityActionButton'
import EditBtn from './EditBtn'
import {
  CheckCircle2,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Menu,
} from 'lucide-react'
import DeleteConfirmDialog from '@/components/ui/AlertDialog'
import { Card, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { handleCapitalizedInput } from '@/lib/capitalize'
import EditSaveCancelButtons from '@/components/shared/EditSaveCancelButtons'
import type { CourseModule, CourseModulesStatus } from '@/lib/schemas/module'
import type { CourseDetail } from '@/lib/schemas'
import { Label } from '@/components/ui/label'
import {
  handleSaveOnEnter,
  truncateDescription,
} from '../../CoursePage/utils/helperFunctions'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import AnalyticsAttentionAlert from './AnalyticsAttentionAlert'
import AnalyticsStatCard from './AnalyticsStatCard'
import { useTranslation } from 'react-i18next'

export type DraftModuleForm = {
  name: string
  description: string
}

type ModuleCardLabels = {
  view?: string
  draftNamePlaceholder?: string
  createModule?: string
  cancelDraft?: string
  draftDescriptionPlaceholder?: string
  materials?: string
  quizzes?: string
  total?: (count: number) => string
  noMaterials?: string
  noMaterialsHint?: string
  noQuizzes?: string
  noQuizzesHint?: string
  noCriticalSignals?: string
  materialsNoInteraction?: (count: number) => string
  quizzesNoSubmission?: (count: number) => string
  quizzesLowScore?: (count: number) => string
  average?: string
  submissions?: string
  questions?: string
  materialsCount?: string
  quizzesCount?: string
  editModuleAria?: (name: string) => string
  deleteModuleAria?: (name: string) => string
  deleteItemType?: string
  onlyLastActive?: string
  onlyFirstHidden?: string
  hide?: string
  activate?: string
}

type BaseModuleCardProps = {
  moduleIndex: number
  labels?: ModuleCardLabels
}

type ExistingModuleCardProps = BaseModuleCardProps & {
  variant: 'existing'
  module: CourseModule
  courseStatus: CourseDetail['status']
  analyticsMode?: boolean
  canToggleModuleVisibility?: boolean
  isToggleVisibilityPending?: boolean
  onOpenModule?: (moduleId: string) => void
  onDeleteModule?: (moduleId: string) => void
  onToggleModuleVisibility?: (
    moduleId: string,
    currentStatus: CourseModulesStatus,
  ) => void
  showGripHandle?: boolean
  gripHandleProps?: {
    attributes: DraggableAttributes
    listeners: SyntheticListenerMap | undefined
  }
  alwaysShowActions?: boolean
  isDragging?: boolean
  lastActiveModuleUuid?: string
  firstPassiveModuleUuid?: string
  userMode?: boolean
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
  const { t } = useTranslation('dashboard')
  if (props.variant === 'draft') {
    const {
      moduleIndex,
      draftModule,
      setDraftModule,
      onCreate,
      onCancel,
      isCreating,
      labels,
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
              onKeyDown={(e) => handleSaveOnEnter(e, onCreate, onCancel)}
              placeholder={
                labels?.draftNamePlaceholder ??
                t('courseOverview.modules.card.draftNamePlaceholder')
              }
              className='placeholder:font-semibold'
            />
            <EditSaveCancelButtons
              onSave={() => onCreate()}
              onCancel={() => onCancel()}
              saveDisabled={isCreating || !draftModule.name.trim()}
              cancelDisabled={isCreating}
              saveAriaLabel={
                labels?.createModule ??
                t('courseOverview.modules.card.createModule')
              }
              cancelAriaLabel={
                labels?.cancelDraft ??
                t('courseOverview.modules.card.cancelDraft')
              }
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
                onKeyDown={(e) => handleSaveOnEnter(e, onCreate, onCancel)}
                placeholder={
                  labels?.draftDescriptionPlaceholder ??
                  t('courseOverview.modules.card.draftDescriptionPlaceholder')
                }
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
    analyticsMode,
    canToggleModuleVisibility,
    isToggleVisibilityPending,
    onOpenModule,
    onDeleteModule,
    onToggleModuleVisibility,
    showGripHandle,
    gripHandleProps,
    alwaysShowActions,
    isDragging,
    lastActiveModuleUuid,
    firstPassiveModuleUuid,
    userMode = false,
    labels,
  } = props

  const isWholeCardDragEnabled = Boolean(gripHandleProps)
  const cardDragProps =
    isWholeCardDragEnabled && gripHandleProps
      ? { ...gripHandleProps.attributes, ...gripHandleProps.listeners }
      : {}
  const isAnalyticsMode = Boolean(analyticsMode)

  const isLastActiveModule =
    module.status === 'active' && lastActiveModuleUuid === module.uuid
  const isFirstPassiveModule =
    module.status === 'passive' && firstPassiveModuleUuid === module.uuid

  const moduleQuizAttempts = module.quizzes.reduce(
    (sum, quiz) => sum + (quiz.attemptsCount ?? 0),
    0,
  )
  const hasMaterials = module.materials.length > 0
  const hasQuizzes = module.quizzes.length > 0
  const moduleQuizzesWithoutSubmits = module.quizzes.filter(
    (quiz) => (quiz.attemptsCount ?? 0) === 0,
  ).length
  const moduleQuizValues = module.quizzes
    .map((quiz) => quiz.averagePercentage)
    .filter((value): value is number => value != null)
  const moduleQuizQuestionsTotal = module.quizzes.reduce(
    (sum, quiz) => sum + quiz.questions.length,
    0,
  )
  const moduleQuizAverage =
    moduleQuizValues.length > 0
      ? Math.round(
          moduleQuizValues.reduce((sum, value) => sum + value, 0) /
            moduleQuizValues.length,
        )
      : null
  const moduleDownloads = module.materials.reduce(
    (sum, material) =>
      sum + (material.type === 'file' ? (material.downloadCount ?? 0) : 0),
    0,
  )
  const moduleCopies = module.materials.reduce(
    (sum, material) =>
      sum + (material.type === 'url' ? (material.copyCount ?? 0) : 0),
    0,
  )
  const moduleOpens = module.materials.reduce(
    (sum, material) =>
      sum + (material.type === 'url' ? (material.openCount ?? 0) : 0),
    0,
  )
  const moduleMaterialsWithoutInteraction = module.materials.filter(
    (material) =>
      material.type === 'file'
        ? (material.downloadCount ?? 0) === 0
        : (material.openCount ?? 0) + (material.copyCount ?? 0) === 0,
  ).length
  const moduleLowScoreQuizzes = module.quizzes.filter((quiz) => {
    if ((quiz.attemptsCount ?? 0) === 0) return false
    if (quiz.averagePercentage == null) return false
    return quiz.averagePercentage < 60
  }).length

  const quizAttentionParts: string[] = []
  if (moduleQuizzesWithoutSubmits > 0) {
    quizAttentionParts.push(
      labels?.quizzesNoSubmission?.(moduleQuizzesWithoutSubmits) ??
        t('courseOverview.modules.card.quizzesNoSubmission', {
          count: moduleQuizzesWithoutSubmits,
        }),
    )
  }
  if (moduleLowScoreQuizzes > 0) {
    quizAttentionParts.push(
      labels?.quizzesLowScore?.(moduleLowScoreQuizzes) ??
        t('courseOverview.modules.card.quizzesLowScore', {
          count: moduleLowScoreQuizzes,
        }),
    )
  }
  const materialsHasAttention =
    hasMaterials && moduleMaterialsWithoutInteraction > 0
  const quizHasAttention = hasQuizzes && quizAttentionParts.length > 0

  return (
    <Card
      className={cn(
        'border border-border/60 shadow-md bg-background',
        isDragging
          ? 'cursor-grabbing'
          : isWholeCardDragEnabled
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-pointer',
      )}
      onClick={() => {
        if (!isWholeCardDragEnabled) {
          onOpenModule?.(module.uuid)
        }
      }}
      role={isWholeCardDragEnabled ? undefined : 'button'}
      tabIndex={isWholeCardDragEnabled ? -1 : 0}
      onKeyDown={
        isWholeCardDragEnabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenModule?.(module.uuid)
              }
            }
      }
      {...cardDragProps}
    >
      <div className='p-3 md:px-5 md:py-4 h-full flex flex-col'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0 flex items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded-full text-foreground font-medium shrink-0',
                userMode
                  ? 'bg-primary/30'
                  : courseStatus !== 'live'
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

          {isAnalyticsMode ? (
            <Button
              variant='grid'
              size='sm'
              className={cn(
                'bg-linear-to-br h-8 text-xs md:text-sm',
                colorStyles.bg['accent-teal-dark'],
                colorStyles.text['accent-teal-dark'],
              )}
              onClick={(e) => {
                e.stopPropagation()
                onOpenModule?.(module.uuid)
              }}
            >
              <span className='font-semibold'>
                {labels?.view ?? t('courseOverview.modules.card.view')}
              </span>
            </Button>
          ) : alwaysShowActions ? (
            <div className='flex shrink-0 items-center gap-2'>
              <EditBtn
                icon={Edit}
                onClick={(e) => {
                  e?.stopPropagation()
                }}
                aria-label={
                  labels?.editModuleAria?.(module.name) ??
                  t('courseOverview.modules.card.editModuleAria', {
                    name: module.name,
                  })
                }
              />
              <EditBtn
                actionType='delete'
                aria-label={
                  labels?.deleteModuleAria?.(module.name) ??
                  t('courseOverview.modules.card.deleteModuleAria', {
                    name: module.name,
                  })
                }
              />
            </div>
          ) : courseStatus === 'draft' && onDeleteModule ? (
            <div className='flex shrink-0 items-center gap-2'>
              <EditBtn
                icon={Edit}
                onClick={(e) => {
                  e?.stopPropagation()
                  onOpenModule?.(module.uuid)
                }}
                aria-label={
                  labels?.editModuleAria?.(module.name) ??
                  t('courseOverview.modules.card.editModuleAria', {
                    name: module.name,
                  })
                }
              />
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteConfirmDialog
                  itemType={
                    labels?.deleteItemType ??
                    t('courseOverview.modules.card.deleteItemType')
                  }
                  itemName={module.name}
                  trigger={
                    <EditBtn
                      actionType='delete'
                      aria-label={
                        labels?.deleteModuleAria?.(module.name) ??
                        t('courseOverview.modules.card.deleteModuleAria', {
                          name: module.name,
                        })
                      }
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

        {isAnalyticsMode ? (
          <div className='mt-2.5 pt-2.5 border-t w-full'>
            <div className='w-full rounded-lg bg-muted/20 overflow-hidden'>
              <div className='grid grid-cols-2 divide-x divide-border/70'>
                <div className='pr-2 flex flex-col gap-2 h-full'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-xs font-semibold text-muted-foreground'>
                      {labels?.materials ?? t('courseOverview.modules.card.materials')}
                    </span>
                    <span className='rounded-full bg-accent-teal-dark/10 px-1.5 py-0.5 text-xs font-semibold text-accent-teal-dark'>
                      {labels?.total?.(module.materials.length) ??
                        t('courseOverview.modules.card.total', {
                          count: module.materials.length,
                        })}
                    </span>
                  </div>
                  {hasMaterials ? (
                    <div className='grid grid-cols-3 gap-1.5 w-full items-stretch flex-1'>
                      {[
                        {
                          label: <Download className='h-3 w-3' />,
                          value: moduleDownloads,
                        },
                        {
                          label: <ExternalLink className='h-3 w-3' />,
                          value: moduleOpens,
                        },
                        {
                          label: <Copy className='h-3 w-3' />,
                          value: moduleCopies,
                        },
                      ].map(({ label, value }, index) => (
                        <AnalyticsStatCard
                          key={index}
                          label={label}
                          value={value}
                          className='h-full flex-col items-center sm:flex-row sm:items-center sm:justify-center'
                          valueClassName='sm:ml-1'
                          inline
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='rounded-md border border-dashed border-border/70 bg-muted/40 px-2.5 py-2.5 text-center h-full'>
                      <p className='text-xs md:text-sm font-semibold text-muted-foreground'>
                        {labels?.noMaterials ??
                          t('courseOverview.modules.card.noMaterials')}
                      </p>
                      <p className='text-[10px] md:text-xs text-muted-foreground/80 mt-0.5'>
                        {labels?.noMaterialsHint ??
                          t('courseOverview.modules.card.noMaterialsHint')}
                      </p>
                    </div>
                  )}
                  {materialsHasAttention ? (
                    <AnalyticsAttentionAlert
                      messages={[
                        labels?.materialsNoInteraction?.(
                          moduleMaterialsWithoutInteraction,
                        ) ??
                          t(
                            'courseOverview.modules.card.materialsNoInteraction',
                            {
                              count: moduleMaterialsWithoutInteraction,
                            },
                          ),
                      ]}
                    />
                  ) : (
                    hasMaterials && (
                      <div className='rounded-lg px-2 py-1 text-[10px] md:text-xs flex items-center gap-1.5 bg-secondary/10 text-accent-teal-light'>
                        <CheckCircle2 className='w-3 h-3 shrink-0 text-accent-teal-light' />
                        <span className='font-medium'>
                          {labels?.noCriticalSignals ??
                            t('courseOverview.modules.card.noCriticalSignals')}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className='pl-2 flex flex-col gap-2 h-full'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-xs font-semibold text-muted-foreground'>
                      {labels?.quizzes ?? t('courseOverview.modules.card.quizzes')}
                    </span>
                    <span className='rounded-full bg-accent-teal-dark/10 px-1.5 py-0.5 text-xs font-semibold text-accent-teal-dark'>
                      {labels?.total?.(module.quizzes.length) ??
                        t('courseOverview.modules.card.total', {
                          count: module.quizzes.length,
                        })}
                    </span>
                  </div>
                  {hasQuizzes ? (
                    <div className='grid grid-cols-3 gap-1.5 w-full items-stretch flex-1'>
                      {[
                        {
                          label:
                            labels?.average ??
                            t('courseOverview.modules.card.average'),
                          value:
                            moduleQuizAverage == null
                              ? '-'
                              : `${moduleQuizAverage}%`,
                        },
                        {
                          label:
                            labels?.submissions ??
                            t('courseOverview.modules.card.submissions'),
                          value: moduleQuizAttempts,
                        },
                        {
                          label:
                            labels?.questions ??
                            t('courseOverview.modules.card.questions'),
                          value: moduleQuizQuestionsTotal,
                        },
                      ].map(({ label, value }) => (
                        <AnalyticsStatCard
                          key={label}
                          label={label}
                          value={value}
                          className='h-full flex-col items-center sm:flex-row sm:items-center sm:justify-center'
                          labelClassName='whitespace-nowrap text-center sm:text-center'
                          valueClassName='sm:ml-1'
                          inline
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='rounded-md border border-dashed border-border/70 bg-muted/40 px-2.5 py-2.5 text-center h-full'>
                      <p className='text-xs md:text-sm font-semibold text-muted-foreground'>
                        {labels?.noQuizzes ??
                          t('courseOverview.modules.card.noQuizzes')}
                      </p>
                      <p className='text-[10px] md:text-xs text-muted-foreground/80 mt-0.5'>
                        {labels?.noQuizzesHint ??
                          t('courseOverview.modules.card.noQuizzesHint')}
                      </p>
                    </div>
                  )}
                  {quizHasAttention ? (
                    <AnalyticsAttentionAlert messages={quizAttentionParts} />
                  ) : (
                    hasQuizzes && (
                      <div className='rounded-lg px-2 py-1 text-[10px] md:text-xs flex items-center gap-1.5 bg-secondary/10 text-accent-teal-light'>
                        <CheckCircle2 className='w-3 h-3 shrink-0 text-accent-teal-light' />
                        <span className='font-medium'>
                          {labels?.noCriticalSignals ??
                            t('courseOverview.modules.card.noCriticalSignals')}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='flex items-center gap-2 mt-1 mb-2 md:mb-3'>
              <CardDescription className='flex-1 min-w-0'>
                {truncateDescription(module.description ?? '', 90)}
              </CardDescription>
              {showGripHandle && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0 shrink-0 ml-auto cursor-grab'
                >
                  <Menu className='w-4 h-4 text-muted-foreground' />
                </Button>
              )}
            </div>

            <div className='flex justify-between gap-3 pt-2 border-t border-border/60'>
              <div className='text-xs md:text-sm flex flex-wrap gap-2 sm:gap-5 items-center'>
                <p className='text-muted-foreground'>
                  {labels?.materialsCount ??
                    t('courseOverview.modules.card.materialsCount')}{' '}
                  <span className='font-semibold text-neutral-black'>
                    {module.materials?.length ?? 0}
                  </span>
                </p>
                <p className='text-muted-foreground'>
                  {labels?.quizzesCount ??
                    t('courseOverview.modules.card.quizzesCount')}{' '}
                  <span className='font-semibold text-neutral-black'>
                    {module.quizzes?.length ?? 0}
                  </span>
                </p>
              </div>
              <div className='flex flex-col items-end gap-2'>
                <div className='flex shrink-0 items-center gap-2'>
                  {courseStatus !== 'draft' && (
                    <Button
                      variant='grid'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenModule?.(module.uuid)
                      }}
                      className={cn(
                        'bg-linear-to-br h-8 text-xs md:text-sm',
                        colorStyles.bg['accent-teal-dark'],
                        colorStyles.text['accent-teal-dark'],
                      )}
                    >
                      <span className='font-semibold'>
                        {labels?.view ?? t('courseOverview.modules.card.view')}
                      </span>
                    </Button>
                  )}
                  {canToggleModuleVisibility && onToggleModuleVisibility && (
                    <ModuleVisibilityActionButton
                      status={module.status}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleModuleVisibility(module.uuid, module.status)
                      }}
                      disabled={
                        Boolean(isToggleVisibilityPending) ||
                        (module.status === 'active' && !isLastActiveModule) ||
                        (module.status === 'passive' && !isFirstPassiveModule)
                      }
                      title={
                        module.status === 'active' && !isLastActiveModule
                          ? labels?.onlyLastActive ??
                            t('moduleDetail.visibility.onlyLastActive')
                          : module.status === 'passive' && !isFirstPassiveModule
                            ? labels?.onlyFirstHidden ??
                              t('moduleDetail.visibility.onlyFirstHidden')
                            : ''
                      }
                      activeLabel={
                        labels?.hide ?? t('moduleDetail.visibility.hide')
                      }
                      passiveLabel={
                        labels?.activate ??
                        t('moduleDetail.visibility.activate')
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

export default ModuleCard
