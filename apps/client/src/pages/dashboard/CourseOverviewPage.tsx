import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import DashboardCourseOverviewSkeleton from '@/components/shared/loadingskeleton/DashboardCourseOverviewSkeleton'
import StateComp from '@/components/shared/StateComp'
import { StatusActionButtons } from '@/components/shared/StatusActionButtons'
import { Button } from '@/components/ui/button'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import {
  useCloneCourseMutation,
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
} from '@/pages/CoursePage/utils/useCourseMutation'
import { useCoursePlanning } from '@/pages/CoursePage/utils/useCoursePlanning'
import {
  useCreateModuleMutation,
  useDeleteModuleMutation,
  useToggleModuleMutation,
} from '@/pages/CoursePage/utils/useModuleMutation'
import CardDate, {
  type CoursePlanningState,
} from '@/pages/CoursesPage/components/CardDate'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import EditableDetailCard from './components/EditableDetailCard'
import ModuleCard, { type DraftModuleForm } from './components/ModuleCard'
import ModulesSection from './components/ModulesSection'
import { Label } from '@/components/ui/label'
import UnderlinedText from '@/components/shared/UnderlinedText'
import DashboardModeTabs from './components/DashboardModeTabs'
import { useTitle } from '@/lib/dynamicTitleHook'
import { ModulesSectionActions } from './components/ModuleSectionActions'
import EditSaveCancelButtons from '@/components/shared/EditSaveCancelButtons'
import { useAutoTopScroll } from '../CoursePage/utils/helperFunctions'

const CourseModulesOverviewPage = () => {
  const navigate = useNavigate()
  const {
    courseId,
    course,
    modules,
    isLoading,
    isError,
    refetchCourse,
    previewMode,
  } = useCourseModulesLayoutContext()

  useTitle(
    course?.name ? `Správa kurzů - ${course.name}` : 'Správa kurzů - kurz',
  )
  useAutoTopScroll()

  const [courseName, setCourseName] = useState<string | null>(null)
  const [courseDescription, setCourseDescription] = useState<string | null>(
    null,
  )
  const [viewMode, setViewMode] = useLocalStorage<'content' | 'analytics'>(
    'dashboard-analytics-mode',
    'content',
  )
  const [draftModule, setDraftModule] = useState<DraftModuleForm | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const queryClient = useQueryClient()

  // Track previous courseId to reset local edits when navigating to a different course
  const prevCourseUuidRef = useRef<string | undefined>(undefined)
  const prevCourseStatusRef = useRef<CourseStatus | undefined>(undefined)

  useEffect(() => {
    if (course?.uuid !== prevCourseUuidRef.current) {
      prevCourseUuidRef.current = course?.uuid
      if (courseName !== null) setCourseName(null)
      if (courseDescription !== null) setCourseDescription(null)
      prevCourseStatusRef.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.uuid])

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
  const { mutateAsync: cloneCourseMutation } = useCloneCourseMutation({
    onSuccess: (clonedCourse) => {
      navigate(`/dashboard/${clonedCourse.uuid}`)
    },
    toastMessage: (source) => `Kurz "${source.name}" byl zkopírován jako návrh`,
  })
  const { mutate: deleteModuleMutation } = useDeleteModuleMutation(courseId)
  const { mutate: createModuleMutation, isPending: createModulePending } =
    useCreateModuleMutation(courseId, () => setDraftModule(null))

  const planningHook = useCoursePlanning({
    courseId,
    queryClient,
  })
  useEffect(() => {
    if (!course) return
    const prevStatus = prevCourseStatusRef.current
    if (prevStatus && prevStatus === 'planned' && course.status === 'live') {
      toast.info(`Kurz ${course.name} byl automaticky spuštěn`)
    }
    prevCourseStatusRef.current = course.status
  }, [course])
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const hasNetworkError = isError || !course

  if (isLoading && !course) {
    return <DashboardCourseOverviewSkeleton />
  }

  if (!isLoading && hasNetworkError) {
    return (
      <StateComp
        type={isOffline ? 'network-offline' : 'error'}
        onAction={() => refetchCourse()}
        message={isOffline ? undefined : 'Nepodařilo se načíst kurz'}
      />
    )
  }

  if (!course) {
    return <DashboardCourseOverviewSkeleton />
  }

  const currentCourseName = courseName ?? course.name
  const currentCourseDescription = courseDescription ?? course.description ?? ''

  const handleCourseStatusChange = (status: CourseStatus) => {
    if (status !== 'draft') {
      setIsReorderMode(false)
    }
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
    currentCourseName !== course.name ||
    currentCourseDescription !== (course.description ?? '')

  const handleSaveCourseDetails = () => {
    if (previewMode || updateCourseDetailsPending || !currentCourseName.trim())
      return

    updateCourseDetailsMutation({
      name: currentCourseName,
      description: currentCourseDescription || undefined,
    })
  }

  const handleCancelCourseDetails = () => {
    setCourseName(null)
    setCourseDescription(null)
  }

  const handleOpenModule = (moduleId: string) => {
    if (!isReorderMode) navigate(`/dashboard/${courseId}/modules/${moduleId}`)
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
    if (previewMode || draftModule || isReorderMode) return
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

  const showPlanningFooter = course.status === 'planned' || planning.isEditing

  const disableDraftActionsInAnalytics =
    course.status === 'draft' && viewMode === 'analytics'

  const lastActiveModuleUuid = modules
    ?.filter((m) => m.status === 'active')
    .at(-1)?.uuid
  const firstPassiveModuleUuid = modules?.find(
    (module) => module.status === 'passive',
  )?.uuid

  const analyticsModules = modules ?? []
  const overviewTabs: Array<{ value: 'content' | 'analytics'; label: string }> =
    [
      ...[{ value: 'content' as const, label: 'Obsah' }],
      ...[{ value: 'analytics' as const, label: 'Statistiky' }],
    ]
  const courseGradientColor =
    course.status === 'live'
      ? 'secondary'
      : course.status === 'paused'
        ? 'accent-teal'
        : course.status === 'planned'
          ? 'primary'
          : course.status === 'draft'
            ? 'accent-teal-light-subtle'
            : 'gray'
  const statusActionColor = courseGradientColor

  const statusActions = (
    <StatusActionButtons
      currentStatus={course.status}
      onStatusChange={handleCourseStatusChange}
      courseColor={statusActionColor}
      className='justify-end shrink-0'
      buttonClassName='lg:h-9'
      labelClassName='text-xs lg:text-sm'
      onCopyAsDraft={() => cloneCourseMutation({ source: course })}
    />
  )

  const saveCourseAction =
    !previewMode && hasCourseDetailsChanges ? (
      <EditSaveCancelButtons
        onSave={handleSaveCourseDetails}
        onCancel={handleCancelCourseDetails}
        saveDisabled={updateCourseDetailsPending || !currentCourseName.trim()}
        cancelDisabled={updateCourseDetailsPending}
        className='flex items-center gap-1'
      />
    ) : undefined

  const planningFooterMeta = showPlanningFooter ? (
    <div className='flex items-center gap-2 w-full justify-between sm:justify-start'>
      <div className='flex-1'>
        <CardDate course={course} state={course.status} planning={planning} />
      </div>
      {planning.isEditing && (
        <div className='shrink-0'>
          <EditSaveCancelButtons
            onSave={() => planning.onConfirm()}
            onCancel={() => planning.onCancel()}
            saveDisabled={planning.saving || !!planning.error}
            cancelDisabled={planning.saving}
            className='flex items-center gap-1'
            saveAriaLabel='Uložit kurz'
            cancelAriaLabel='Zrušit úpravy'
          />
        </div>
      )}
    </div>
  ) : undefined

  return (
    <>
      <EditableDetailCard
        gradient={courseGradientColor}
        breadcrumbItems={[
          { label: 'Správa kurzů', path: '/dashboard' },
          { label: currentCourseName },
        ]}
        nameValue={currentCourseName}
        descriptionValue={currentCourseDescription}
        onNameChange={(value) => {
          setCourseName(handleCapitalizedInput(value, currentCourseName))
        }}
        onDescriptionChange={(value) => {
          setCourseDescription(
            handleCapitalizedInput(value, currentCourseDescription),
          )
        }}
        onEnterSave={handleSaveCourseDetails}
        onCancelEdit={handleCancelCourseDetails}
        disabled={previewMode}
        isDirty={!previewMode && hasCourseDetailsChanges}
        saveDisabled={updateCourseDetailsPending || !currentCourseName.trim()}
        createdAt={course.createdAt}
        updatedAt={course.updatedAt}
        topBadges={
          <div className='flex flex-wrap items-center gap-2'>
            <CourseStateBadge status={course.status} />
          </div>
        }
        topActions={
          saveCourseAction ? (
            <div className='flex items-center gap-2'>{saveCourseAction}</div>
          ) : undefined
        }
        footerMeta={planningFooterMeta}
        hideDatesOnSmall={planning.isEditing}
        footerActions={
          planning.isEditing ? (
            <div className='hidden sm:flex'>{statusActions}</div>
          ) : (
            statusActions
          )
        }
      />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Label className='font-bold text-lg md:text-xl text-neutral-black'>
          <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
            {viewMode === 'analytics' ? 'Statistiky modulů' : 'Moduly kurzu'}
          </UnderlinedText>
        </Label>
        <ModulesSectionActions
          courseStatus={course.status}
          previewMode={previewMode}
          modulesLength={modules?.length ?? 0}
          disableActions={disableDraftActionsInAnalytics}
          isReorderMode={isReorderMode}
          draftModule={draftModule}
          onToggleReorderMode={() => setIsReorderMode((prev) => !prev)}
          onAddModule={handleAddModuleDraft}
          headerRightSlot={
            overviewTabs.length > 1 ? (
              <DashboardModeTabs
                value={viewMode}
                tabs={overviewTabs}
                onChange={setViewMode}
              />
            ) : undefined
          }
        />
      </div>

      {viewMode === 'content' ? (
        <ModulesSection
          courseId={courseId}
          modules={modules ?? []}
          courseStatus={course.status}
          draftModule={draftModule}
          setDraftModule={setDraftModule}
          previewMode={previewMode}
          isReorderMode={isReorderMode}
          disableActions={disableDraftActionsInAnalytics}
          onToggleReorderMode={() => setIsReorderMode((prev) => !prev)}
          onAddModule={handleAddModuleDraft}
          onOpenModule={handleOpenModule}
          onCreateModule={handleCreateModule}
          onDeleteModule={deleteModuleMutation}
          onToggleVisibility={handleToggleModuleVisibility}
          isCreating={createModulePending}
          isToggleVisibilityPending={togglePending}
          lastActiveModuleUuid={lastActiveModuleUuid}
          firstPassiveModuleUuid={firstPassiveModuleUuid}
        />
      ) : (
        <section className='space-y-4'>
          {analyticsModules.length === 0 ? (
            <StateComp
              type='no-content'
              message='Kurz zatím nemá žádné moduly'
              className='py-8'
            />
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 '>
              {analyticsModules.map((module, moduleIndex) => (
                <ModuleCard
                  key={module.uuid}
                  variant='existing'
                  module={module}
                  moduleIndex={moduleIndex + 1}
                  courseStatus={course.status}
                  onOpenModule={handleOpenModule}
                  analyticsMode
                  lastActiveModuleUuid={lastActiveModuleUuid}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default CourseModulesOverviewPage
