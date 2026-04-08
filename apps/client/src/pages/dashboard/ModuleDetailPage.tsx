import {
  getCourseModules,
  getModuleByUuid,
  updateModule,
} from '@/api/queries/moduleQueries'
import StateComp from '@/components/shared/StateComp'
import {
  DetailsContentSkeleton,
  MaterialsContentSkeleton,
  QuizzesContentSkeleton,
} from '@/components/shared/loadingskeleton/DetailsSkeleton'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { Material, Quiz } from '@/lib/schemas'
import type {
  CourseModulesStatus,
  ModuleDetail,
  ModuleSummary,
} from '@/lib/schemas/module'
import {
  buildOrgDashboardCoursePath,
  buildOrgDashboardPath,
} from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  type CreateMaterialPayload,
  type MaterialDraft,
  useCreateMutation,
  useDeleteMaterialMutation,
  useUpdateMutation,
} from '../CoursePage/utils/useMaterialMutation'
import {
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useUpdateQuizMutation,
} from '../CoursePage/utils/useQuizMutation'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import thinkIconUrl from '@/assets/t-think-blue1.svg'
import EditableDetailCard from './components/EditableDetailCard'
import MaterialsSection from './components/MaterialsSection'
import ModuleVisibilityActionButton from './components/ModuleVisibilityActionButton'
import QuizzesSection from './components/QuizzesSection'
import UserModuleTab from './components/ModuleTab'
import { toast } from 'sonner'
import { useAutoTopScroll } from '../CoursePage/utils/helperFunctions'

type QueryError = Error & { status?: number }

const ModuleVisibilityBadge = ({
  status,
  activeLabel,
  hiddenLabel,
}: {
  status: CourseModulesStatus
  activeLabel: string
  hiddenLabel: string
}) => (
  <Badge
    variant='secondary'
    className={cn(
      status === 'active'
        ? 'bg-secondary/40 text-[#2D8B6B]'
        : 'bg-muted text-muted-foreground',
    )}
  >
    {status === 'active' ? activeLabel : hiddenLabel}
  </Badge>
)

const CourseModuleDetailPage = () => {
  const { t, i18n } = useTranslation('dashboard')
  const uiLocale = i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'
  const { orgSlug, courseId, moduleId } = useParams<{
    orgSlug?: string
    courseId: string
    moduleId: string
  }>()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] })
    }
    if (courseId && moduleId) {
      queryClient.invalidateQueries({ queryKey: ['course-module', courseId, moduleId] })
    }
  }, [uiLocale, courseId, moduleId, queryClient])
  const [expandedQuizIds, setExpandedQuizIds] = useState<string[]>([])
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)
  const [draftQuiz, setDraftQuiz] = useState<Quiz | null>(null)
  const [moduleName, setModuleName] = useState<string | null>(null)
  const [moduleDescription, setModuleDescription] = useState<string | null>(
    null,
  )
  const [moduleUpdatedAt, setModuleUpdatedAt] = useState<string | Date>()
  const { course, previewMode } = useCourseModulesLayoutContext()
  useAutoTopScroll()

  const {
    data: modules = [],
    isLoading: modulesLoading,
    isError: modulesError,
    refetch: refetchModules,
  } = useQuery<ModuleSummary[], QueryError>({
    queryKey: ['course-modules', courseId],
    queryFn: () => getCourseModules(courseId!, orgSlug),
    enabled: Boolean(courseId),
    networkMode: 'always',
  })

  const {
    data: selectedModule,
    isLoading: moduleLoading,
    isError: moduleError,
    error: moduleQueryError,
    refetch: refetchModule,
  } = useQuery<ModuleDetail, QueryError>({
    queryKey: ['course-module', courseId, moduleId],
    queryFn: () => getModuleByUuid(courseId!, moduleId!, orgSlug),
    enabled: Boolean(courseId && moduleId),
    networkMode: 'always',
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || !selectedModule) {
        throw new Error(t('moduleDetail.missingCourseOrModule'))
      }

      return updateModule(
        courseId,
        selectedModule.uuid,
        {
          status: selectedModule.status === 'active' ? 'passive' : 'active',
        },
        orgSlug,
      )
    },
    onSuccess: async (updatedModule) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['course-modules', courseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['course-module', courseId, moduleId],
        }),
        queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
      ])
      toast.success(
        updatedModule.status === 'active'
          ? t('moduleDetail.activated')
          : t('moduleDetail.hiddenSuccess'),
      )
    },
    onError: () => {
      toast.error(t('moduleDetail.visibilityError'))
    },
  })

  const saveModuleDetailsMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string
      description: string
    }) => {
      if (!courseId || !moduleId) {
        throw new Error(t('moduleDetail.missingCourseOrModule'))
      }

      return updateModule(
        courseId,
        moduleId,
        {
          name,
          description: description || undefined,
        },
        orgSlug,
      )
    },
    onSuccess: async (updatedModule) => {
      setModuleName(null)
      setModuleDescription(null)
      setModuleUpdatedAt(updatedModule.updatedAt)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['course-modules', courseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['course-module', courseId, moduleId],
        }),
        queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
      ])

      toast.success(t('moduleDetail.updated'))
    },
  })

  const { mutateAsync: updateMaterialMutation } = useUpdateMutation(
    courseId ?? '',
    moduleId ?? '',
  )
  const { mutateAsync: createMaterialMutation } = useCreateMutation(
    courseId ?? '',
    moduleId ?? '',
    setDraftMaterial,
  )
  const { mutateAsync: deleteMaterialMutation } = useDeleteMaterialMutation(
    courseId ?? '',
    moduleId ?? '',
  )

  const { mutate: updateQuizMutation, isPending: updateQuizPending } =
    useUpdateQuizMutation(courseId ?? '', moduleId ?? '')
  const { mutate: createQuizMutation, isPending: createQuizPending } =
    useCreateQuizMutation(courseId ?? '', moduleId ?? '', setDraftQuiz)
  const { mutate: deleteQuizMutation } = useDeleteQuizMutation(
    courseId ?? '',
    moduleId ?? '',
  )

  useTitle(
    selectedModule?.name
      ? t('moduleDetail.pageTitleWithName', { name: selectedModule.name })
      : t('moduleDetail.pageTitleFallback'),
  )

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isModuleNotFound = moduleQueryError?.status === 404

  const isLastActiveModule =
    modules.filter((m) => m.status === 'active').at(-1)?.uuid ===
    selectedModule?.uuid
  const isFirstPassiveModule =
    modules.find((m) => m.status === 'passive')?.uuid === selectedModule?.uuid

  if (!courseId || !moduleId) {
    return (
      <StateComp
        type='not-found'
        message={t('moduleDetail.notFound')}
        actionText={t('moduleDetail.backToModules')}
      />
    )
  }

  if (!moduleLoading && moduleError) {
    if (isModuleNotFound) {
      return <StateComp type='not-found' message={t('moduleDetail.notFound')} />
    }

    return (
      <StateComp
        type={isOffline ? 'network-offline' : 'error'}
        onAction={() => {
          void Promise.all([refetchModules(), refetchModule()])
        }}
      />
    )
  }

  if (!moduleLoading && !selectedModule) {
    return <StateComp type='not-found' message={t('moduleDetail.notFound')} />
  }

  const currentModuleName = moduleName ?? selectedModule?.name ?? ''
  const currentModuleDescription =
    moduleDescription ?? selectedModule?.description ?? ''
  const canToggleModuleVisibility = course?.status === 'live'
  const canEditModuleInfo = course?.status === 'draft'
  const hasModuleDetailsChanges =
    currentModuleName !== (selectedModule?.name ?? '') ||
    currentModuleDescription !== (selectedModule?.description ?? '')

  const handleSaveModuleDetails = () => {
    if (
      !canEditModuleInfo ||
      saveModuleDetailsMutation.isPending ||
      !currentModuleName.trim()
    ) {
      return
    }

    saveModuleDetailsMutation.mutate({
      name: currentModuleName,
      description: currentModuleDescription,
    })
  }

  const handleCancelModuleDetails = () => {
    setModuleName(null)
    setModuleDescription(null)
  }

  const handleUpdateMaterial = async (
    materialId: string,
    data: MaterialDraft,
  ) => {
    await updateMaterialMutation({ materialId, data })
  }

  const handleSaveDraft = async (data: MaterialDraft) => {
    if (!draftMaterial) return

    const payload: CreateMaterialPayload =
      data.type === 'file'
        ? {
            type: 'file',
            name: data.name || draftMaterial.name || '',
            file: data.file!,
            description: data.description || '',
          }
        : {
            type: 'url',
            name: data.name || draftMaterial.name || '',
            url: data.url!,
            description: data.description || '',
          }

    await createMaterialMutation(payload)
  }

  const handleCancelDraft = () => {
    setDraftMaterial(null)
  }

  const handleDeleteMaterial = async (materialId: string) => {
    await deleteMaterialMutation(materialId)
  }

  const handleAddMaterial = () => {
    if (draftMaterial) return

    setDraftMaterial({
      uuid: '00000000-0000-0000-0000-000000000000',
      name: '',
      description: '',
      type: 'file',
      fileUrl: '',
    })
  }

  const handleUpdateQuiz = (quizId: string, editedQuiz: Quiz) => {
    const cleanedQuiz: Quiz = {
      ...editedQuiz,
      averagePercentage: editedQuiz.averagePercentage ?? 0,
      questions: editedQuiz.questions.map((q) => {
        if (q.uuid?.startsWith('temp-')) {
          const { uuid, ...questionWithoutUuid } = q
          return questionWithoutUuid
        }
        return q
      }),
    }
    updateQuizMutation({
      quizId,
      data: cleanedQuiz,
    })
  }

  const handleCreateQuiz = (editedQuiz: Quiz) => {
    const cleanedQuiz: Quiz = {
      ...editedQuiz,
      uuid: undefined,
      averagePercentage: 0,
      questions: editedQuiz.questions.map((q) => {
        const { uuid, ...questionWithoutUuid } = q
        return questionWithoutUuid
      }),
    }
    createQuizMutation(cleanedQuiz)
  }

  const handleAddQuiz = () => {
    const newDraft: Quiz = {
      uuid: `temp-${Date.now()}`,
      title: '',
      difficulty: 'easy',
      attemptsCount: 0,
      questions: [
        {
          uuid: `temp-${Date.now()}`,
          type: 'singleChoice',
          question: '',
          options: ['', ''],
          correctIndex: 0,
        },
      ],
    }
    setDraftQuiz(newDraft)
  }

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuizMutation(quizId)
  }

  const canEditQuizzes = course && course.status === 'draft'
  const moduleGradient =
    course?.status === 'live'
      ? selectedModule?.status === 'active'
        ? 'secondary'
        : 'gray'
      : course?.status === 'paused'
        ? 'accent-teal'
        : course?.status === 'planned'
          ? 'primary'
          : course?.status === 'draft'
            ? 'accent-teal-light-subtle'
            : 'gray'

  return (
    <div className='space-y-4'>
      {modules.length > 1 && (
        <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6'>
          <div className='flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap md:flex-1 overflow-x-auto '>
            {modulesLoading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-10 w-28 rounded-xl shrink-0' />
                ))
              : !modulesError &&
                modules.map((m, i) => (
                  <UserModuleTab
                    key={m.uuid}
                    module={m}
                    index={i}
                    path='dashboard'
                  />
                ))}
          </div>
        </div>
      )}

      {moduleLoading || !selectedModule ? (
        <DetailsContentSkeleton />
      ) : (
        <EditableDetailCard
          gradient={moduleGradient}
          breadcrumbItems={[
            {
              label: t('moduleDetail.breadcrumbRoot'),
              path: buildOrgDashboardPath(orgSlug),
            },
            {
              label: course?.name ?? t('moduleDetail.breadcrumbCourseFallback'),
              path: buildOrgDashboardCoursePath(orgSlug, courseId),
            },
            { label: currentModuleName },
          ]}
          noActionsSlot={
            <img
              src={thinkIconUrl}
              className='w-7 h-7 md:w-8 md:h-8 opacity-90'
              alt=''
              aria-hidden='true'
            />
          }
          nameValue={currentModuleName}
          descriptionValue={currentModuleDescription}
          onNameChange={(value) => {
            setModuleName(handleCapitalizedInput(value, currentModuleName))
          }}
          onDescriptionChange={(value) => {
            setModuleDescription(
              handleCapitalizedInput(value, currentModuleDescription),
            )
          }}
          onEnterSave={handleSaveModuleDetails}
          onCancelEdit={handleCancelModuleDetails}
          disabled={!canEditModuleInfo}
          isDirty={canEditModuleInfo && hasModuleDetailsChanges}
          saveDisabled={
            saveModuleDetailsMutation.isPending || !currentModuleName.trim()
          }
          createdAt={
            typeof selectedModule.createdAt === 'string'
              ? selectedModule.createdAt
              : selectedModule.createdAt?.toISOString()
          }
          updatedAt={
            typeof moduleUpdatedAt === 'string'
              ? moduleUpdatedAt
              : moduleUpdatedAt
                ? moduleUpdatedAt.toISOString()
                : undefined
          }
          labels={{
            saveMobile: t('moduleDetail.card.saveMobile'),
            saveDesktop: t('moduleDetail.card.saveDesktop'),
            name: t('moduleDetail.card.name'),
            namePlaceholder: t('moduleDetail.card.namePlaceholder'),
            nameRequired: t('moduleDetail.card.nameRequired'),
            description: t('moduleDetail.card.description'),
            descriptionPlaceholder: t('moduleDetail.card.descriptionPlaceholder'),
            createdAt: t('moduleDetail.card.createdAt'),
            updatedAt: t('moduleDetail.card.updatedAt'),
          }}
          topBadges={
            <>
              {canToggleModuleVisibility && (
                <ModuleVisibilityBadge
                  status={selectedModule.status}
                  activeLabel={t('moduleDetail.active')}
                  hiddenLabel={t('moduleDetail.hidden')}
                />
              )}
            </>
          }
          footerActions={
            canToggleModuleVisibility ? (
              <div className='flex flex-wrap items-center gap-2 justify-end'>
                <ModuleVisibilityActionButton
                  status={selectedModule.status}
                  onClick={() => toggleVisibilityMutation.mutate()}
                  disabled={
                    toggleVisibilityMutation.isPending ||
                    (selectedModule.status === 'active' &&
                      !isLastActiveModule) ||
                    (selectedModule.status === 'passive' &&
                      !isFirstPassiveModule)
                  }
                  activeLabel={t('moduleDetail.visibility.hide')}
                  passiveLabel={t('moduleDetail.visibility.activate')}
                  title={
                    selectedModule.status === 'active' && !isLastActiveModule
                      ? t('moduleDetail.visibility.onlyLastActive')
                      : selectedModule.status === 'passive' &&
                          !isFirstPassiveModule
                        ? t('moduleDetail.visibility.onlyFirstHidden')
                        : ''
                  }
                />
              </div>
            ) : undefined
          }
        />
      )}

      {moduleLoading || !selectedModule ? (
        <MaterialsContentSkeleton />
      ) : (
        <MaterialsSection
          materials={selectedModule.materials}
          draftMaterial={draftMaterial}
          previewMode={previewMode}
          canEdit={!!canEditModuleInfo}
          courseStatus={course?.status}
          onAddMaterial={handleAddMaterial}
          onSaveMaterial={handleUpdateMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onSaveDraft={handleSaveDraft}
          onCancelDraft={handleCancelDraft}
        />
      )}

      {moduleLoading || !selectedModule ? (
        <QuizzesContentSkeleton />
      ) : (
        <QuizzesSection
          quizzes={selectedModule.quizzes}
          draftQuiz={draftQuiz}
          expandedQuizIds={expandedQuizIds}
          previewMode={previewMode}
          canEdit={!!canEditQuizzes}
          courseStatus={course?.status ?? 'draft'}
          isCreating={createQuizPending}
          isUpdating={updateQuizPending}
          onAddQuiz={handleAddQuiz}
          onUpdateQuiz={handleUpdateQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onCreateQuiz={handleCreateQuiz}
          onCancelDraft={() => setDraftQuiz(null)}
          onToggleExpand={(quizId) => {
            setExpandedQuizIds((prev) =>
              prev.includes(quizId)
                ? prev.filter((id) => id !== quizId)
                : [...prev, quizId],
            )
          }}
        />
      )}
    </div>
  )
}

export default CourseModuleDetailPage
