import CoursePlanningSection from '@/components/shared/CoursePlanningSection'
import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import StateComp from '@/components/shared/StateComp'
import { StatusActionButtons } from '@/components/shared/StatusActionButtons'
import { Button } from '@/components/ui/button'
import { handleCapitalizedInput } from '@/lib/capitalize'
import {
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
} from '@/pages/CoursePage/utils/useCourseMutation'
import { useCoursePlanning } from '@/pages/CoursePage/utils/useCoursePlanning'
import {
  useCreateModuleMutation,
  useDeleteModuleMutation,
  useToggleModuleMutation,
} from '@/pages/CoursePage/utils/useModuleMutation'
import type { CoursePlanningState } from '@/pages/CoursesPage/components/CardDate'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import EditableDetailCard from './components/EditableDetailCard'
import { type DraftModuleForm } from './components/ModuleCard'
import ModulesSection from './components/ModulesSection'

const CourseModulesOverviewPage = () => {
  const navigate = useNavigate()
  const isSm = useMediaQuery('(min-width: 640px)')
  const {
    courseId,
    course,
    modules,
    isLoading,
    isError,
    refetchCourse,
    previewMode,
  } = useCourseModulesLayoutContext()
  const [courseName, setCourseName] = useState(course?.name ?? '')
  const [courseDescription, setCourseDescription] = useState(
    course?.description ?? '',
  )
  const [draftModule, setDraftModule] = useState<DraftModuleForm | null>(null)
  const queryClient = useQueryClient()

  const {
    mutate: updateCourseDetailsMutation,
    isPending: updateCourseDetailsPending,
  } = useUpdateCourseMutation(courseId, (updatedCourse) => {
    setCourseName(updatedCourse.name)
    setCourseDescription(updatedCourse.description ?? '')
  })

  const { mutate: toggleModuleVisibilityMutation, isPending: togglePending } =
    useToggleModuleMutation(courseId)
  const { mutate: updateCourseStatusMutation } =
    useUpdateCourseStatusMutation(courseId)
  const { mutate: deleteModuleMutation } = useDeleteModuleMutation(courseId)
  const { mutate: createModuleMutation, isPending: createModulePending } =
    useCreateModuleMutation(courseId, () => setDraftModule(null))

  const planningHook = useCoursePlanning({
    courseId,
    queryClient,
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  if (isLoading) {
    return <StateComp type='no-content' message='Načítání kurzu...' />
  }

  if (isError || !course) {
    return (
      <StateComp
        type={isOffline ? 'network-offline' : 'error'}
        onAction={() => refetchCourse()}
        message={isOffline ? undefined : 'Nepodařilo se načíst kurz'}
      />
    )
  }

  const handleCourseStatusChange = (status: CourseStatus) => {
    if (status === 'planned') {
      planningHook.openPlanningEditor(course, true)
      return
    }

    planningHook.closePlanningEditor()
    updateCourseStatusMutation(
      { status },
      {
        onSuccess: () => {
          toast.success(
            {
              draft: 'Kurz byl převeden do návrhu',
              planned: 'Kurz byl naplánován',
              live: 'Kurz byl spuštěn',
              paused: 'Kurz byl pozastaven',
              archived: 'Kurz byl archivován',
            }[status],
          )
        },
      },
    )
  }

  const hasCourseDetailsChanges =
    courseName !== course.name ||
    courseDescription !== (course.description ?? '')

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
    toggleModuleVisibilityMutation({
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

  const planning: CoursePlanningState = {
    editable: course.status === 'planned',
    isEditing: planningHook.planningIsEditing,
    value: planningHook.planningDateTime,
    error: planningHook.planningError,
    saving: planningHook.planningSaving,
    onOpen: () => planningHook.openPlanningEditor(course, false),
    onChange: (value: string) => {
      planningHook.setPlanningDateTime(value)
      if (planningHook.planningError) {
        planningHook.setPlanningError('')
      }
    },
    onConfirm: planningHook.handlePlanningConfirm,
    onCancel: planningHook.closePlanningEditor,
  }

  const statusActions = (
    <StatusActionButtons
      currentStatus={course.status}
      onStatusChange={handleCourseStatusChange}
      courseColor={'accent-teal-dark'}
      className='justify-end shrink-0'
      buttonClassName='md:h-9'
      labelClassName='text-xs md:text-sm'
      onCopyAsDraft={() => handleCourseStatusChange('draft')}
      hideCopyAsDraft={course.status === 'archived'}
    />
  )

  const showPlanningForHeader =
    course.status === 'planned' || planning.isEditing
  const showPlanningOnSeparateRow = !isSm && showPlanningForHeader

  return (
    <>
      <EditableDetailCard
        gradient={'accent-teal-dark'}
        breadcrumbItems={[
          { label: 'Správa kurzů', path: '/dashboard' },
          { label: 'Moduly' },
        ]}
        nameValue={courseName}
        descriptionValue={courseDescription}
        onNameChange={(value) => {
          setCourseName(handleCapitalizedInput(value, courseName))
        }}
        onDescriptionChange={(value) => {
          setCourseDescription(handleCapitalizedInput(value, courseDescription))
        }}
        disabled={previewMode}
        createdAt={course.createdAt}
        updatedAt={course.updatedAt}
        topBadges={
          <div className='flex flex-wrap items-center gap-2'>
            <CourseStateBadge status={course.status} />
          </div>
        }
        headerBottom={
          showPlanningOnSeparateRow ? (
            <CoursePlanningSection
              course={course}
              state={course.status}
              planning={planning}
              hideStatusLabel
              className='w-fit'
            />
          ) : undefined
        }
        topActions={
          <div className='flex items-center gap-2'>
            {!showPlanningOnSeparateRow && showPlanningForHeader && (
              <CoursePlanningSection
                course={course}
                state={course.status}
                planning={planning}
                hideStatusLabel
                className='w-fit min-w-[18rem] shrink-0'
                rowClassName='justify-end'
              />
            )}
            {statusActions}
          </div>
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

      <ModulesSection
        courseId={courseId}
        modules={modules ?? []}
        courseStatus={course.status}
        draftModule={draftModule}
        setDraftModule={setDraftModule}
        previewMode={previewMode}
        onAddModule={handleAddModuleDraft}
        onOpenModule={handleOpenModule}
        onCreateModule={handleCreateModule}
        onDeleteModule={deleteModuleMutation}
        onToggleVisibility={handleToggleModuleVisibility}
        isCreating={createModulePending}
        isToggleVisibilityPending={togglePending}
      />
    </>
  )
}

export default CourseModulesOverviewPage
