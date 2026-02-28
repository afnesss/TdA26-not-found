import CoursePlanningSection from '@/components/shared/CoursePlanningSection'
import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import DashboardCourseOverviewSkeleton from '@/components/shared/loadingskeleton/DashboardCourseOverviewSkeleton'
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
  const [viewMode, setViewMode] = useState<'content' | 'analytics'>('content')
  const [draftModule, setDraftModule] = useState<DraftModuleForm | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
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
  const analyticsAllowed =
    course.status === 'live' ||
    course.status === 'paused' ||
    course.status === 'archived'
  const analyticsModules = modules ?? []

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

      <div className='flex gap-2'>
        <Button
          variant='filter'
          size='sm'
          className={`rounded-xl ${
            viewMode === 'content'
              ? 'bg-primary text-background hover:bg-primary/90'
              : ''
          }`}
          onClick={() => setViewMode('content')}
        >
          Obsah
        </Button>
        {analyticsAllowed && (
          <Button
            variant='filter'
            size='sm'
            className={`rounded-xl ${
              viewMode === 'analytics'
                ? 'bg-primary text-background hover:bg-primary/90'
                : ''
            }`}
            onClick={() => setViewMode('analytics')}
          >
            Analytika
          </Button>
        )}
      </div>

      {viewMode === 'content' || !analyticsAllowed ? (
        <ModulesSection
          courseId={courseId}
          modules={modules ?? []}
          courseStatus={course.status}
          draftModule={draftModule}
          setDraftModule={setDraftModule}
          previewMode={previewMode}
          isReorderMode={isReorderMode}
          onToggleReorderMode={() => setIsReorderMode((prev) => !prev)}
          onAddModule={handleAddModuleDraft}
          onOpenModule={handleOpenModule}
          onCreateModule={handleCreateModule}
          onDeleteModule={deleteModuleMutation}
          onToggleVisibility={handleToggleModuleVisibility}
          isCreating={createModulePending}
          isToggleVisibilityPending={togglePending}
        />
      ) : (
        <section className='space-y-4'>
          <div className='space-y-3'>
            {analyticsModules.map((module) => {
              const moduleMaterialInteractions = module.materials.reduce(
                (sum, mat) =>
                  sum +
                  (mat.type === 'file'
                    ? (mat.downloadCount ?? 0)
                    : (mat.openCount ?? 0) + (mat.copyCount ?? 0)),
                0,
              )
              const moduleQuizAttempts = module.quizzes.reduce(
                (sum, quiz) => sum + (quiz.attemptsCount ?? 0),
                0,
              )
              const moduleQuizzesWithoutSubmits = module.quizzes.filter(
                (quiz) => (quiz.attemptsCount ?? 0) === 0,
              ).length
              const moduleQuizValues = module.quizzes
                .map((quiz) => quiz.averagePercentage)
                .filter((value): value is number => value != null)
              const moduleQuizAverage =
                moduleQuizValues.length > 0
                  ? Math.round(
                      moduleQuizValues.reduce((sum, value) => sum + value, 0) /
                        moduleQuizValues.length,
                    )
                  : null
              const moduleDownloads = module.materials.reduce(
                (sum, material) =>
                  sum +
                  (material.type === 'file'
                    ? (material.downloadCount ?? 0)
                    : 0),
                0,
              )
              const moduleCopies = module.materials.reduce(
                (sum, material) =>
                  sum +
                  (material.type === 'url' ? (material.copyCount ?? 0) : 0),
                0,
              )
              const moduleOpens = module.materials.reduce(
                (sum, material) =>
                  sum +
                  (material.type === 'url' ? (material.openCount ?? 0) : 0),
                0,
              )
              const moduleLowScoreQuizzes = module.quizzes.filter((quiz) => {
                if ((quiz.attemptsCount ?? 0) === 0) return false
                if (quiz.averagePercentage == null) return false
                return quiz.averagePercentage < 60
              }).length

              return (
                <div
                  key={module.uuid}
                  className='rounded-xl border border-border/70 bg-background p-3 shadow-sm transition hover:shadow-md'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div>
                      <p className='text-sm font-semibold leading-tight'>
                        {module.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Materiály {module.materials.length} • Testy{' '}
                        {module.quizzes.length}
                      </p>
                    </div>
                    <Button
                      variant='filter'
                      size='sm'
                      className='rounded-lg'
                      onClick={() => handleOpenModule(module.uuid)}
                    >
                      Otevřít modul
                    </Button>
                  </div>
                  <div className='mt-3 grid grid-cols-1 gap-3 text-xs lg:grid-cols-2'>
                    <div className='rounded-lg border border-border/50 bg-muted/20 p-3'>
                      <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                        Materiály
                      </p>
                      <div className='space-y-1 text-muted-foreground'>
                        <p>
                          Celkem:{' '}
                          <span className='font-semibold text-foreground'>
                            {module.materials.length}
                          </span>
                        </p>
                        <p>
                          Stažení:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleDownloads}
                          </span>{' '}
                          • Open:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleOpens}
                          </span>{' '}
                          • Copy:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleCopies}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='rounded-lg border border-border/50 bg-muted/20 p-3'>
                      <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                        Testy
                      </p>
                      <div className='space-y-1 text-muted-foreground'>
                        <p>
                          Celkem:{' '}
                          <span className='font-semibold text-foreground'>
                            {module.quizzes.length}
                          </span>
                        </p>
                        <p>
                          Odeslání:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleQuizAttempts}
                          </span>{' '}
                          • Bez submitu:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleQuizzesWithoutSubmits}
                          </span>
                        </p>
                        <p>
                          Průměr:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleQuizAverage == null
                              ? '—'
                              : `${moduleQuizAverage}%`}
                          </span>{' '}
                          • Nízké skóre:{' '}
                          <span className='font-semibold text-foreground'>
                            {moduleLowScoreQuizzes}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

export default CourseModulesOverviewPage
