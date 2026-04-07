import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import DashboardCourseOverviewSkeleton from '@/components/shared/loadingskeleton/DashboardCourseOverviewSkeleton'
import CourseLeaderboard from '@/components/shared/CourseLeaderboard'
import CourseQuizCountBadge from '@/components/shared/CourseQuizCountBadge'
import CourseLeaderboardSkeleton from '@/components/shared/loadingskeleton/CourseLeaderboardSkeleton'
import StateComp from '@/components/shared/StateComp'
import { StatusActionButtons } from '@/components/shared/StatusActionButtons'
import { getCourseSessionOverview } from '@/api/queries/courseQueries'
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import EditableDetailCard from './components/EditableDetailCard'
import ModuleCard, { type DraftModuleForm } from './components/ModuleCard'
import ModulesSection from './components/ModulesSection'
import { Label } from '@/components/ui/label'
import UnderlinedText from '@/components/shared/UnderlinedText'
import DashboardModeTabs from './components/DashboardModeTabs'
import { useTitle } from '@/lib/dynamicTitleHook'
import { getStoredUiLocale } from '@/lib/i18n'
import { ModulesSectionActions } from './components/ModuleSectionActions'
import EditSaveCancelButtons from '@/components/shared/EditSaveCancelButtons'
import CourseExportTrigger from '@/components/shared/CourseExportTrigger'
import { useAutoTopScroll } from '../CoursePage/utils/helperFunctions'
import CourseShareTrigger from '@/components/shared/CourseShareTrigger'
import {
  buildOrgDashboardCoursePath,
  buildOrgDashboardModulePath,
  buildOrgDashboardPath,
} from '@/lib/routes'
import { useMediaQuery } from 'usehooks-ts'

const CourseModulesOverviewPage = () => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
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
    course?.name
      ? t('courseOverview.pageTitleWithName', { name: course.name })
      : t('courseOverview.pageTitleFallback'),
  )
  useAutoTopScroll()

  const [courseDraft, setCourseDraft] = useState<{
    courseUuid?: string
    name: string | null
    description: string | null
  }>({
    courseUuid: undefined,
    name: null,
    description: null,
  })
  const isMd = useMediaQuery('(min-width: 768px)')
  const [viewMode, setViewMode] = useLocalStorage<'content' | 'analytics'>(
    'dashboard-analytics-mode',
    'content',
  )
  const [draftModule, setDraftModule] = useState<DraftModuleForm | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const queryClient = useQueryClient()

  const prevCourseUuidRef = useRef<string | undefined>(undefined)
  const prevCourseStatusRef = useRef<CourseStatus | undefined>(undefined)

  const {
    mutate: updateCourseDetailsMutation,
    isPending: updateCourseDetailsPending,
  } = useUpdateCourseMutation(
    courseId,
    (updatedCourse) => {
      setCourseDraft({
        courseUuid: updatedCourse.uuid,
        name: updatedCourse.name,
        description: updatedCourse.description ?? '',
      })
    },
    orgSlug,
  )

  const { mutate: toggleModuleVisibilityMutation, isPending: togglePending } =
    useToggleModuleMutation(courseId, orgSlug)
  const { mutate: updateCourseStatusMutation } = useUpdateCourseStatusMutation(
    courseId,
    orgSlug,
  )
  const { mutateAsync: cloneCourseMutation } = useCloneCourseMutation(
    {
      onSuccess: (clonedCourse) => {
        navigate(buildOrgDashboardCoursePath(orgSlug, clonedCourse.uuid))
      },
      toastMessage: (source) =>
        t('courseOverview.cloneSuccess', { name: source.name }),
    },
    orgSlug,
  )
  const { mutate: deleteModuleMutation } = useDeleteModuleMutation(
    courseId,
    orgSlug,
  )
  const { mutate: createModuleMutation, isPending: createModulePending } =
    useCreateModuleMutation(courseId, () => setDraftModule(null), orgSlug)

  const planningHook = useCoursePlanning({
    courseId,
    queryClient,
    orgSlug,
  })

  useEffect(() => {
    if (!course) return

    if (prevCourseUuidRef.current !== course.uuid) {
      prevCourseUuidRef.current = course.uuid
      prevCourseStatusRef.current = course.status
      return
    }

    const prevStatus = prevCourseStatusRef.current
    if (prevStatus && prevStatus === 'planned' && course.status === 'live') {
      toast.info(t('courseOverview.autoStarted', { name: course.name }))
    }
    prevCourseStatusRef.current = course.status
  }, [course, t])

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const hasNetworkError = isError || !course
  const showLeaderboard =
    course?.status === 'live' ||
    course?.status === 'paused' ||
    course?.status === 'archived'

  const { data: courseSessionOverview, isLoading: isLeaderboardLoading } =
    useQuery({
      queryKey: ['course-session-overview', courseId],
      queryFn: () => getCourseSessionOverview(courseId),
      enabled: Boolean(course) && showLeaderboard,
      refetchOnReconnect: true,
    })
  const leaderboard = courseSessionOverview?.leaderboard ?? []

  if (isLoading && !course) {
    return <DashboardCourseOverviewSkeleton />
  }

  if (!isLoading && hasNetworkError) {
    return (
      <StateComp
        type={isOffline ? 'network-offline' : 'error'}
        onAction={() => refetchCourse()}
        message={isOffline ? undefined : t('courseOverview.loadError')}
      />
    )
  }

  if (!course) {
    return <DashboardCourseOverviewSkeleton />
  }

  const isCurrentCourseDraft = courseDraft.courseUuid === course.uuid
  const currentCourseName =
    isCurrentCourseDraft && courseDraft.name !== null
      ? courseDraft.name
      : course.name
  const currentCourseDescription =
    isCurrentCourseDraft && courseDraft.description !== null
      ? courseDraft.description
      : (course.description ?? '')

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
          toast.success(t(`courseOverview.statusChanged.${status}`))
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
    setCourseDraft({
      courseUuid: course.uuid,
      name: null,
      description: null,
    })
  }

  const handleOpenModule = (moduleId: string) => {
    if (!isReorderMode) {
      navigate(buildOrgDashboardModulePath(orgSlug, courseId, moduleId))
    }
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
      sourceLocale: getStoredUiLocale(),
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
      { value: 'content', label: t('courseOverview.modules.tabs.content') },
      { value: 'analytics', label: t('courseOverview.modules.tabs.analytics') },
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
      labels={{
        schedule: t('courseOverview.statusActions.schedule'),
        copyAsDraft: t('courseOverview.statusActions.copyAsDraft'),
        copyShort: t('courseOverview.statusActions.copyShort'),
        launch: t('courseOverview.statusActions.launch'),
        toDraft: t('courseOverview.statusActions.toDraft'),
        archive: t('courseOverview.statusActions.archive'),
        pause: t('courseOverview.statusActions.pause'),
        resume: t('courseOverview.statusActions.resume'),
      }}
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
            saveAriaLabel={t('courseOverview.planning.saveAriaLabel')}
            cancelAriaLabel={t('courseOverview.planning.cancelAriaLabel')}
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
          {
            label: t('courseOverview.card.breadcrumbRoot'),
            path: buildOrgDashboardPath(orgSlug),
          },
          { label: currentCourseName },
        ]}
        nameValue={currentCourseName}
        descriptionValue={currentCourseDescription}
        onNameChange={(value) => {
          setCourseDraft((prevDraft) => ({
            ...prevDraft,
            courseUuid: course.uuid,
            name: handleCapitalizedInput(value, currentCourseName),
          }))
        }}
        onDescriptionChange={(value) => {
          setCourseDraft((prevDraft) => ({
            ...prevDraft,
            courseUuid: course.uuid,
            description: handleCapitalizedInput(value, currentCourseDescription),
          }))
        }}
        onEnterSave={handleSaveCourseDetails}
        onCancelEdit={handleCancelCourseDetails}
        disabled={previewMode}
        isDirty={!previewMode && hasCourseDetailsChanges}
        saveDisabled={updateCourseDetailsPending || !currentCourseName.trim()}
        createdAt={course.createdAt}
        updatedAt={course.updatedAt}
        labels={{
          saveMobile: t('courseOverview.card.saveMobile'),
          saveDesktop: t('courseOverview.card.saveDesktop'),
          name: t('courseOverview.card.name'),
          namePlaceholder: t('courseOverview.card.namePlaceholder'),
          nameRequired: t('courseOverview.card.nameRequired'),
          description: t('courseOverview.card.description'),
          descriptionPlaceholder: t(
            'courseOverview.card.descriptionPlaceholder',
          ),
          createdAt: t('courseOverview.card.createdAt'),
          updatedAt: t('courseOverview.card.updatedAt'),
        }}
        topBadges={
          <div className='flex flex-wrap items-center gap-2'>
            <CourseStateBadge status={course.status} />
          </div>
        }
        topActions={
          <div className='flex items-center gap-2'>
            {saveCourseAction}
            <CourseExportTrigger
              courseId={courseId}
              courseName={currentCourseName}
              variant='detail'
              label={isMd ? t('courseOverview.export.label') : ''}
              triggerAriaLabel={t('courseOverview.export.triggerAriaLabel')}
              itemLabel={t('courseOverview.export.itemLabel')}
              successMessage={t('courseOverview.export.success')}
              errorMessage={t('courseOverview.export.error')}
            />
          </div>
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
        noActionsSlot={
          course.status === 'live' ? (
            <CourseShareTrigger
              courseId={courseId}
              courseName={currentCourseName}
              size='md'
              labels={{
                qrAlt: t('courseOverview.share.qrAlt'),
                regenerateSuccess: t('courseOverview.share.regenerateSuccess'),
                regenerateError: t('courseOverview.share.regenerateError'),
                title: t('courseOverview.share.title'),
                description: t('courseOverview.share.description'),
                loadError: t('courseOverview.share.loadError'),
                loading: t('courseOverview.share.loading'),
                copyLink: t('courseOverview.share.copyLink'),
                shareLink: t('courseOverview.share.shareLink'),
                regenerateQr: t('courseOverview.share.regenerateQr'),
                copySuccess: t('courseOverview.share.copySuccess'),
                copyError: t('courseOverview.share.copyError'),
                shareText: (name: string) =>
                  t('courseOverview.share.shareText', { name }),
              }}
            />
          ) : undefined
        }
      />

      {showLeaderboard &&
        (isLeaderboardLoading ? (
          <CourseLeaderboardSkeleton />
        ) : (
          <>
            <div className='flex items-center justify-between gap-3'>
              <Label className='font-bold'>
                <UnderlinedText
                  height='10'
                  strokeWidth='4'
                  offset='-bottom-0.5'
                >
                  {t('courseOverview.leaderboard.title')}
                </UnderlinedText>
              </Label>
              <CourseQuizCountBadge
                totalQuizzes={courseSessionOverview?.totalQuizzes ?? 0}
                label={t('courseOverview.leaderboard.quizzesInCourse')}
              />
            </div>
            <CourseLeaderboard
              leaderboard={leaderboard}
              showLeaderTrophy
              emptyMessage={t('courseOverview.leaderboard.empty')}
              showLessLabel={t('courseOverview.leaderboard.showLess')}
              showMoreLabel={(count) =>
                t('courseOverview.leaderboard.showMore', { count })
              }
              attemptLabel={(count) => {
                if (count === 1) return t('courseOverview.leaderboard.attempt_one')
                if (count >= 2 && count <= 4) {
                  return t('courseOverview.leaderboard.attempt_few')
                }
                return t('courseOverview.leaderboard.attempt_many')
              }}
            />
          </>
        ))}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Label className='font-bold text-lg md:text-xl text-neutral-black'>
          <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
            {viewMode === 'analytics'
              ? t('courseOverview.modules.titleAnalytics')
              : t('courseOverview.modules.titleContent')}
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
          labels={{
            cancelReorder: t('courseOverview.modules.actions.cancelReorder'),
            reorder: t('courseOverview.modules.actions.reorder'),
            addModule: t('courseOverview.modules.actions.addModule'),
          }}
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
          emptyMessage={t('courseOverview.modules.emptyAnalytics')}
          moduleCardLabels={{
            view: t('courseOverview.modules.card.view'),
            draftNamePlaceholder: t(
              'courseOverview.modules.card.draftNamePlaceholder',
            ),
            createModule: t('courseOverview.modules.card.createModule'),
            cancelDraft: t('courseOverview.modules.card.cancelDraft'),
            draftDescriptionPlaceholder: t(
              'courseOverview.modules.card.draftDescriptionPlaceholder',
            ),
            materials: t('courseOverview.modules.card.materials'),
            quizzes: t('courseOverview.modules.card.quizzes'),
            total: (count) => t('courseOverview.modules.card.total', { count }),
            noMaterials: t('courseOverview.modules.card.noMaterials'),
            noMaterialsHint: t('courseOverview.modules.card.noMaterialsHint'),
            noQuizzes: t('courseOverview.modules.card.noQuizzes'),
            noQuizzesHint: t('courseOverview.modules.card.noQuizzesHint'),
            noCriticalSignals: t(
              'courseOverview.modules.card.noCriticalSignals',
            ),
            materialsNoInteraction: (count) =>
              t('courseOverview.modules.card.materialsNoInteraction', { count }),
            quizzesNoSubmission: (count) =>
              t('courseOverview.modules.card.quizzesNoSubmission', { count }),
            quizzesLowScore: (count) =>
              t('courseOverview.modules.card.quizzesLowScore', { count }),
            average: t('courseOverview.modules.card.average'),
            submissions: t('courseOverview.modules.card.submissions'),
            questions: t('courseOverview.modules.card.questions'),
            materialsCount: t('courseOverview.modules.card.materialsCount'),
            quizzesCount: t('courseOverview.modules.card.quizzesCount'),
            editModuleAria: (name) =>
              t('courseOverview.modules.card.editModuleAria', { name }),
            deleteModuleAria: (name) =>
              t('courseOverview.modules.card.deleteModuleAria', { name }),
            deleteItemType: t('courseOverview.modules.card.deleteItemType'),
            onlyLastActive: t('moduleDetail.visibility.onlyLastActive'),
            onlyFirstHidden: t('moduleDetail.visibility.onlyFirstHidden'),
            hide: t('moduleDetail.visibility.hide'),
            activate: t('moduleDetail.visibility.activate'),
          }}
        />
      ) : (
        <section className='space-y-4'>
          {analyticsModules.length === 0 ? (
            <StateComp
              type='no-content'
              message={t('courseOverview.modules.emptyAnalytics')}
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
