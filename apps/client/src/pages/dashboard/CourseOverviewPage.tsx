import { getCourseById, updateCourse } from '@/api/queries/courseQueries'
import { updateModule } from '@/api/queries/moduleQueries'
import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import { StatusActionButtons } from '@/components/shared/StatusActionButtons'
import EditSaveCancelButtons from '@/components/shared/EditSaveCancelButtons'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { handleCapitalizedInput } from '@/lib/capitalize'
import type { CourseDetail } from '@/lib/schemas'
import type { CourseModule, CourseModulesStatus } from '@/lib/schemas/module'
import { useUpdateCourseMutation } from '@/pages/CoursePage/utils/useCourseMutation'
import {
  useCreateModuleMutation,
  useDeleteModuleMutation,
} from '@/pages/CoursePage/utils/useModuleMutation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import DashboardAddButton from './components/DashboardAddButton'
import EditableDetailCard from './components/EditableDetailCard'
import ModuleCard, { type DraftModuleForm } from './components/ModuleCard'

type QueryError = Error & { status?: number }

const CourseModulesOverviewPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { courseId, previewMode, courseMeta } = useCourseModulesLayoutContext()
  const [courseName, setCourseName] = useState(courseMeta.name)
  const [courseDescription, setCourseDescription] = useState(
    courseMeta.description ?? '',
  )
  const [draftModule, setDraftModule] = useState<DraftModuleForm | null>(null)

  const {
    data: course,
    isError: courseError,
    isLoading: courseLoading,
    refetch: refetchCourse,
  } = useQuery<CourseDetail, QueryError>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: Boolean(courseId),
    networkMode: 'always',
  })

  const {
    mutate: updateCourseDetailsMutation,
    isPending: updateCourseDetailsPending,
  } = useUpdateCourseMutation(courseId, (updatedCourse) => {
    setCourseName(updatedCourse.name)
    setCourseDescription(updatedCourse.description ?? '')
  })

  const updateCourseStatusMutation = useMutation({
    mutationFn: (status: CourseStatus) => updateCourse(courseId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
    },
  })

  const toggleModuleVisibilityMutation = useMutation({
    mutationFn: ({
      moduleId,
      nextStatus,
    }: {
      moduleId: string
      nextStatus: 'active' | 'passive'
    }) => updateModule(courseId, moduleId, { status: nextStatus }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      await queryClient.invalidateQueries({
        queryKey: ['course-modules', courseId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['course-feed', courseId],
      })
    },
  })

  const { mutate: deleteModuleMutation } = useDeleteModuleMutation(courseId)
  const { mutate: createModuleMutation, isPending: createModulePending } =
    useCreateModuleMutation(courseId, () => setDraftModule(null))

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  if (courseLoading) {
    return <StateComp type='no-content' message='Načítání kurzu...' />
  }

  if (courseError || !course) {
    return (
      <StateComp
        type={isOffline ? 'network-offline' : 'error'}
        onAction={() => refetchCourse()}
        message={isOffline ? undefined : 'Nepodařilo se načíst kurz'}
      />
    )
  }

  const modules = course.modules ?? []
  const shouldPlaceDraftInExistingLastRow =
    Boolean(draftModule) && modules.length > 0 && modules.length % 2 === 1
  const modulesForGrid = shouldPlaceDraftInExistingLastRow
    ? modules.slice(0, -1)
    : modules
  const lastModule = shouldPlaceDraftInExistingLastRow
    ? modules[modules.length - 1]
    : null
  const canToggleModuleVisibility =
    courseMeta.status === 'draft' || courseMeta.status === 'live'
  const hasCourseDetailsChanges =
    courseName !== courseMeta.name ||
    courseDescription !== (courseMeta.description ?? '')

  const handleCourseStatusChange = (status: CourseStatus) => {
    updateCourseStatusMutation.mutate(status)
  }

  const handleSaveCourseDetails = () => {
    if (previewMode || updateCourseDetailsPending || !courseName.trim()) return

    updateCourseDetailsMutation({
      name: courseName,
      description: courseDescription || undefined,
    })
  }

  const handleOpenModule = (moduleId: string) => {
    navigate(`/dashboard/${courseId}/modules/${moduleId}`)
  }

  const handleToggleModuleVisibility = (
    moduleId: string,
    currentStatus: 'active' | 'passive',
  ) => {
    if (!canToggleModuleVisibility) return

    toggleModuleVisibilityMutation.mutate({
      moduleId,
      nextStatus: currentStatus === 'active' ? 'passive' : 'active',
    })
  }

  const handleAddModuleDraft = () => {
    if (previewMode || draftModule) return
    setDraftModule({ name: '', description: '' })
  }

  const handleCreateModule = () => {
    if (!draftModule || createModulePending) return

    const trimmedName = draftModule.name.trim()
    if (!trimmedName) return

    createModuleMutation({
      name: trimmedName,
      description: draftModule.description.trim() || undefined,
      status: 'passive',
    })
  }

  return (
    <>
      <EditableDetailCard
        gradient={'accent-teal-dark'}
        breadcrumbItems={[
          { label: 'Správa kurzů', path: '/dashboard' },
          { label: 'Moduly' },
        ]}
        title='Detaily kurzu'
        nameValue={courseName}
        descriptionValue={courseDescription}
        onNameChange={(value) => {
          setCourseName(handleCapitalizedInput(value, courseName))
        }}
        onDescriptionChange={(value) => {
          setCourseDescription(handleCapitalizedInput(value, courseDescription))
        }}
        disabled={previewMode}
        createdAt={courseMeta.createdAt}
        updatedAt={courseMeta.updatedAt}
        topBadges={
          <>
            <CourseStateBadge status={courseMeta.status} />
          </>
        }
        topActions={
          <StatusActionButtons
            currentStatus={courseMeta.status}
            onStatusChange={handleCourseStatusChange}
            courseColor={'accent-teal-dark'}
            className='justify-end'
            buttonClassName='md:h-9'
            labelClassName='text-xs md:text-sm'
            onCopyAsDraft={() => handleCourseStatusChange('draft')}
            hideCopyAsDraft={courseMeta.status === 'archived'}
          />
        }
        footerActions={
          !previewMode ? (
            <Button
              variant='primary'
              size='grid'
              className='w-fit'
              onClick={handleSaveCourseDetails}
              disabled={
                !hasCourseDetailsChanges ||
                updateCourseDetailsPending ||
                !courseName.trim()
              }
            >
              Uložit změny
            </Button>
          ) : undefined
        }
      />

      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg md:text-xl font-bold text-neutral-black'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Moduly kurzu
            </UnderlinedText>
          </h2>

          {!previewMode && (
            <DashboardAddButton
              label='Přidat modul'
              className='rounded-full'
              onClick={handleAddModuleDraft}
              disabled={Boolean(draftModule)}
            />
          )}
        </div>

        {modules.length === 0 && !draftModule ? (
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
                courseStatus={courseMeta.status}
                onOpenModule={handleOpenModule}
                canToggleModuleVisibility={canToggleModuleVisibility}
                isToggleVisibilityPending={
                  toggleModuleVisibilityMutation.isPending
                }
                onDeleteModule={deleteModuleMutation}
                onToggleModuleVisibility={handleToggleModuleVisibility}
              />
            )}

            {lastModule && draftModule && (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <ModuleCard
                  variant='existing'
                  module={lastModule}
                  moduleIndex={modules.length}
                  courseStatus={courseMeta.status}
                  canToggleModuleVisibility={canToggleModuleVisibility}
                  isToggleVisibilityPending={
                    toggleModuleVisibilityMutation.isPending
                  }
                  onOpenModule={handleOpenModule}
                  onDeleteModule={deleteModuleMutation}
                  onToggleModuleVisibility={handleToggleModuleVisibility}
                />

                <ModuleCard
                  variant='draft'
                  moduleIndex={modules.length + 1}
                  draftModule={draftModule}
                  setDraftModule={setDraftModule}
                  onCreate={handleCreateModule}
                  onCancel={() => setDraftModule(null)}
                  isCreating={createModulePending}
                />
              </div>
            )}

            {draftModule && !lastModule && (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <ModuleCard
                  variant='draft'
                  moduleIndex={modules.length + 1}
                  draftModule={draftModule}
                  setDraftModule={setDraftModule}
                  onCreate={handleCreateModule}
                  onCancel={() => setDraftModule(null)}
                  isCreating={createModulePending}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CourseModulesOverviewPage
