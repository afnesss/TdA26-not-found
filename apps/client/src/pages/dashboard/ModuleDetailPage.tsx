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
import type {
  CourseModulesStatus,
  ModuleDetail,
  ModuleSummary,
} from '@/lib/schemas/module'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import EditableDetailCard from './components/EditableDetailCard'
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
  const [moduleName, setModuleName] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [moduleUpdatedAt, setModuleUpdatedAt] = useState<string | Date>()
  const { courseMeta, previewMode } = useCourseModulesLayoutContext()

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['course-modules', courseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['course-module', courseId, moduleId],
        }),
        queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
      ])
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
      setModuleName(updatedModule.name)
      setModuleDescription(updatedModule.description ?? '')
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

  useTitle(selectedModule?.name || 'Správa modulů - modul')

  // useEffect(() => {
  //   if (!selectedModule) return

  //   // Use a ref to track previous moduleId to avoid unnecessary state updates
  //   setModuleName(selectedModule.name)
  //   setModuleDescription(selectedModule.description ?? '')
  //   setModuleUpdatedAt(selectedModule.updatedAt)
  // }, [moduleId])

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

  const liveModuleVisibility = courseMeta.status === 'live'
  const canEditModuleInfo = courseMeta.status === 'draft'
  const hasModuleDetailsChanges =
    moduleName !== selectedModule.name ||
    moduleDescription !== (selectedModule.description ?? '')

  const handleSaveModuleDetails = () => {
    if (
      !canEditModuleInfo ||
      saveModuleDetailsMutation.isPending ||
      !moduleName.trim()
    ) {
      return
    }

    saveModuleDetailsMutation.mutate({
      name: moduleName,
      description: moduleDescription,
    })
  }

  return (
    <div className='space-y-4'>
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6'>
        <div className='flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap md:flex-1 overflow-x-auto pb-1'>
          {modules.map((m, i) => (
            <UserModuleTab key={m.uuid} module={m} index={i} />
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
          { label: moduleName || selectedModule.name },
        ]}
        title='Detaily modulu'
        nameValue={moduleName}
        descriptionValue={moduleDescription}
        onNameChange={(value) => {
          setModuleName(handleCapitalizedInput(value, moduleName))
        }}
        onDescriptionChange={(value) => {
          setModuleDescription(handleCapitalizedInput(value, moduleDescription))
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
            {liveModuleVisibility && (
              <ModuleVisibilityBadge status={selectedModule.status} />
            )}
          </>
        }
        topActions={
          <div className='flex flex-wrap items-center gap-2 justify-end'>
            {liveModuleVisibility && (
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
                !moduleName.trim()
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
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl border-dashed'
            >
              <Plus className='size-4' />
              Přidat materiál
            </Button>
          )}
        </div>

        <div className='space-y-3'>
          {selectedModule.materials.length ? (
            selectedModule.materials.map((mat) => (
              <MaterialCard
                key={mat.uuid}
                material={mat}
                type='edit'
                onDelete={async () => Promise.resolve()}
                onSave={async () => Promise.resolve()}
              />
            ))
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
          {!previewMode && (
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl border-dashed'
            >
              <Plus className='size-4' />
              Přidat kvíz
            </Button>
          )}
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
