import {
  getCourseModules,
  getModuleByUuid,
  updateModule,
} from '@/api/queries/moduleQueries'
import MaterialCard from '@/components/shared/MaterialComponent'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { Material } from '@/lib/schemas'
import type {
  CourseModulesStatus,
  ModuleDetail,
  ModuleSummary,
} from '@/lib/schemas/module'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  type CreateMaterialPayload,
  type MaterialDraft,
  useCreateMutation,
  useDeleteMaterialMutation,
  useUpdateMutation,
} from '../CoursePage/utils/useMaterialMutation'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import EditableDetailCard from './components/EditableDetailCard'
import DashboardAddButton from './components/DashboardAddButton'
import ModuleVisibilityActionButton from './components/ModuleVisibilityActionButton'
import UserModuleTab from './components/ModuleTab'
import { toast } from 'sonner'

type QueryError = Error & { status?: number }

const ModuleVisibilityBadge = ({ status }: { status: CourseModulesStatus }) => (
  <Badge
    variant='secondary'
    className={cn(
      status === 'active'
        ? 'bg-secondary/30 text-secondary-foreground'
        : 'bg-muted text-muted-foreground',
    )}
  >
    {status === 'active' ? 'Aktivní' : 'Skrytý'}
  </Badge>
)

const CourseModuleDetailPage = () => {
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()
  const queryClient = useQueryClient()
  const [expandedQuizIds, setExpandedQuizIds] = useState<string[]>([])
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)
  const [moduleName, setModuleName] = useState<string | null>(null)
  const [moduleDescription, setModuleDescription] = useState<string | null>(
    null,
  )
  const [moduleUpdatedAt, setModuleUpdatedAt] = useState<string | Date>()
  const { course, previewMode } = useCourseModulesLayoutContext()

  const {
    data: modules = [],
    isLoading: modulesLoading,
    isError: modulesError,
    error: modulesQueryError,
    refetch: refetchModules,
  } = useQuery<ModuleSummary[], QueryError>({
    queryKey: ['course-modules', courseId],
    queryFn: () => getCourseModules(courseId!),
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
    queryFn: () => getModuleByUuid(courseId!, moduleId!),
    enabled: Boolean(courseId && moduleId),
    networkMode: 'always',
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || !selectedModule) {
        throw new Error('Missing course/module')
      }

      return updateModule(courseId, selectedModule.uuid, {
        status: selectedModule.status === 'active' ? 'passive' : 'active',
      })
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
          ? 'Modul byl úspěšně aktivován'
          : 'Modul byl úspěšně skryt',
      )
    },
    onError: () => {
      toast.error('Chyba při změně stavu modulu')
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
        throw new Error('Missing course/module')
      }

      return updateModule(courseId, moduleId, {
        name,
        description: description || undefined,
      })
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

      toast.success('Modul aktualizován')
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

  useTitle(selectedModule?.name || 'Správa modulů - modul')

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isLoading = modulesLoading || moduleLoading
  const anyError = modulesQueryError ?? moduleQueryError
  const hasError = modulesError || moduleError
  const isNotFound = anyError?.status === 404

  if (!courseId || !moduleId) {
    return (
      <StateComp
        type='not-found'
        message='Modul nebyl nalezen'
        actionText='Zpět na moduly'
      />
    )
  }

  if (isLoading) {
    return <StateComp type='no-content' message='Načítání modulu...' />
  }

  if (hasError) {
    if (isNotFound) {
      return <StateComp type='not-found' message='Modul nebyl nalezen' />
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

  if (!selectedModule) {
    return <StateComp type='not-found' message='Modul nebyl nalezen' />
  }

  const currentModuleName = moduleName ?? selectedModule.name
  const currentModuleDescription =
    moduleDescription ?? selectedModule.description ?? ''
  const canToggleModuleVisibility =
    course && (course.status === 'draft' || course.status === 'live')
  const canEditModuleInfo = course && course.status === 'draft'
  const hasModuleDetailsChanges =
    currentModuleName !== selectedModule.name ||
    currentModuleDescription !== (selectedModule.description ?? '')

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

  return (
    <div className='space-y-4'>
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6'>
        <div className='flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap md:flex-1 overflow-x-auto '>
          {modules.map((m, i) => (
            <UserModuleTab key={m.uuid} module={m} index={i} path='dashboard' />
          ))}
        </div>
      </div>

      <EditableDetailCard
        gradient='accent-teal'
        breadcrumbItems={[
          { label: 'Správa kurzů', path: '/dashboard' },
          {
            label: 'Moduly',
            path: `/dashboard/${courseId}`,
          },
          { label: currentModuleName },
        ]}
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
        disabled={!canEditModuleInfo}
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
        topBadges={
          <>
            {canToggleModuleVisibility && (
              <ModuleVisibilityBadge status={selectedModule.status} />
            )}
          </>
        }
        topActions={
          <div className='flex flex-wrap items-center gap-2 justify-end'>
            {canToggleModuleVisibility && (
              <ModuleVisibilityActionButton
                status={selectedModule.status}
                onClick={() => toggleVisibilityMutation.mutate()}
                disabled={toggleVisibilityMutation.isPending}
              />
            )}
          </div>
        }
        footerActions={
          canEditModuleInfo ? (
            <Button
              variant='primary'
              size='grid'
              className='w-fit'
              onClick={handleSaveModuleDetails}
              disabled={
                !hasModuleDetailsChanges ||
                saveModuleDetailsMutation.isPending ||
                !currentModuleName.trim()
              }
            >
              Uložit změny
            </Button>
          ) : undefined
        }
      />

      <section className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='font-bold'>
            <UnderlinedText strokeWidth='4'>Studijní materiály</UnderlinedText>
          </Label>
          {!previewMode && (
            <DashboardAddButton
              label='Přidat materiál'
              onClick={handleAddMaterial}
              disabled={!!draftMaterial}
            />
          )}
        </div>

        <div className='space-y-3'>
          {draftMaterial || selectedModule.materials.length ? (
            <>
              {draftMaterial && (
                <MaterialCard
                  material={draftMaterial}
                  type='edit'
                  isDraft={true}
                  onSave={handleSaveDraft}
                  onCancel={handleCancelDraft}
                />
              )}
              {selectedModule.materials.map((mat) =>
                course && course.status === 'draft' ? (
                  <MaterialCard
                    key={mat.uuid}
                    material={mat}
                    type='edit'
                    onDelete={async () => handleDeleteMaterial(mat.uuid)}
                    onSave={async (editedMaterial) =>
                      handleUpdateMaterial(mat.uuid, editedMaterial)
                    }
                  />
                ) : (
                  <MaterialCard key={mat.uuid} material={mat} type='classic' />
                ),
              )}
            </>
          ) : (
            <StateComp
              type='no-content'
              message='Zatím žádné materiály'
              className='pt-8 pb-0'
            />
          )}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='font-bold mb-0'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Kvízy
            </UnderlinedText>
          </Label>
          {!previewMode && <DashboardAddButton label='Přidat kvíz' />}
        </div>

        <div className='space-y-3'>
          {selectedModule.quizzes.length ? (
            selectedModule.quizzes.map((quiz) => {
              const quizId = quiz.uuid

              return (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode='lecturer'
                  onSave={() => undefined}
                  onDelete={() => undefined}
                  isExpanded={quizId ? expandedQuizIds.includes(quizId) : false}
                  onToggleExpand={() => {
                    if (!quizId) return

                    setExpandedQuizIds((prev) =>
                      prev.includes(quizId)
                        ? prev.filter((id) => id !== quizId)
                        : [...prev, quizId],
                    )
                  }}
                />
              )
            })
          ) : (
            <StateComp
              type='no-content'
              message='Zatím žádné kvízy'
              className='pt-8 pb-0'
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default CourseModuleDetailPage
