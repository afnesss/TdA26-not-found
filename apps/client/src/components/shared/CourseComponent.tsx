import { getCourseDashboardAnalytics } from '@/api/queries/courseQueries'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import type {
  CourseDashboardAnalytics,
  CourseStatus,
  CourseSummary,
} from '@/lib/schemas'
import { buildOrgCoursePath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { CoursePlanningState } from '@/pages/CoursesPage/components/CardDate'
import { useQuery } from '@tanstack/react-query'
import { Edit } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import {
  handleSaveOnEnter,
  truncateDescription,
} from '../../pages/CoursePage/utils/helperFunctions'
import CardDate from '../../pages/CoursesPage/components/CardDate'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import DeleteConfirmDialog from '../ui/AlertDialog'
import { Textarea } from '../ui/textarea'
import CoursePlanningSection from './CoursePlanningSection'
import CourseExportTrigger from './CourseExportTrigger'
import { CourseStateBadge } from './CourseStateBadge'
import EditSaveCancelButtons from './EditSaveCancelButtons'
import AnalyticsSection from './Statistics/StatisticsCourseSesction'
import { StatusActionButtons } from './StatusActionButtons'
import CourseShareTrigger from './CourseShareTrigger'

interface CourseClassic {
  type: 'classic'
  course: CourseSummary
  index: number
}

interface CourseEdit {
  type: 'edit'
  course: CourseSummary
  index: number
  statisticsMode?: boolean
  isDraft?: true
  onEdit: () => void
  onSaveDraft?: (data: { name: string; description?: string }) => void
  onCancelDraft?: () => void
  onDelete?: () => void
  onStatusChange?: (courseId: string, newStatus: CourseStatus) => void
  onCopyAsDraft?: (source: CourseSummary) => void
  planning?: CoursePlanningState
}

type CourseCompProps = CourseClassic | CourseEdit

const CourseComponent = (props: CourseCompProps) => {
  const { course, type } = props
  const { t } = useTranslation(['courses', 'dashboard'])
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const courseColor: keyof typeof colorStyles.bg =
    course.status === 'live'
      ? 'secondary'
      : course.status === 'paused'
        ? 'accent-teal'
        : course.status === 'planned'
          ? 'primary'
          : course.status === 'draft'
            ? 'accent-teal-light-subtle'
            : 'gray'
  const lineColor: keyof typeof colorStyles.line =
    course.status === 'live'
      ? 'secondary'
      : course.status === 'paused'
        ? 'accent-teal'
        : course.status === 'planned'
          ? 'primary'
          : course.status === 'draft'
            ? 'accent-teal-light-subtle'
            : 'gray'

  const [state, setState] = useState({
    isEditing: type === 'edit' && 'isDraft' in props ? props.isDraft : false,
    tempName: course.name || '',
    tempDescription: course.description || '',
    nameError: '',
    saving: false,
  })

  const isEditableCourseCard =
    type === 'edit' && !('isDraft' in props && props.isDraft)
  const canOpenCourse =
    course.status === 'live' &&
    (!course.startedAt || new Date(course.startedAt) <= new Date())

  const isAnalyticsMode = type === 'edit' && Boolean(props.statisticsMode)

  const {
    data: overviewCourse,
    isLoading: overviewLoading,
    isError: overviewError,
  } = useQuery<CourseDashboardAnalytics>({
    queryKey: ['course-dashboard-analytics', course.uuid],
    queryFn: () => getCourseDashboardAnalytics(course.uuid, orgSlug),
    enabled: isEditableCourseCard && isAnalyticsMode && !state.isEditing,
    staleTime: 1000 * 20,
  })

  const averageQuizScore = overviewCourse?.averageQuizPercentage ?? null
  const overviewModulesCount = overviewCourse?.modulesCount ?? 0
  const overviewActiveModulesCount =
    overviewCourse?.modules.filter((module) => module.status === 'active')
      .length ?? 0
  const overviewMaterialsCount = overviewCourse?.materialsCount ?? 0
  const overviewQuizzesCount = overviewCourse?.quizzesCount ?? 0
  const overviewDownloadCount = overviewCourse?.downloadCount ?? 0
  const overviewCopyCount = overviewCourse?.copyCount ?? 0
  const overviewOpenCount = overviewCourse?.openCount ?? 0
  const overviewCompletions =
    overviewCourse?.modules.reduce((sum, m) => sum + m.quizAttempts, 0) ?? 0
  const activeModulesWithoutInteraction =
    overviewCourse?.modules.filter(
      (module) => module.status === 'active' && module.interactions === 0,
    ).length ?? 0
  const lowScoreQuizzes = overviewCourse?.lowScoreQuizzes ?? 0

  const attentionParts: string[] = []
  if (activeModulesWithoutInteraction > 0) {
    attentionParts.push(
      t('courseOverview.card.analytics.attention.activeModulesWithoutInteraction', {
        ns: 'dashboard',
        count: activeModulesWithoutInteraction,
      }),
    )
  } else if (overviewActiveModulesCount === 0) {
    attentionParts.push(
      t('courseOverview.card.analytics.attention.noActiveModules', {
        ns: 'dashboard',
      }),
    )
  } else if (lowScoreQuizzes > 0) {
    attentionParts.push(
      t('courseOverview.card.analytics.attention.lowScoreQuizzes', {
        ns: 'dashboard',
        count: lowScoreQuizzes,
      }),
    )
  }

  const handleNameChange = (name: string) => {
    const capitalizedName = handleCapitalizedInput(name, state.tempName)
    setState((prev) => ({
      ...prev,
      tempName: capitalizedName,
      nameError: !capitalizedName.trim()
        ? t('courseOverview.card.nameRequired', { ns: 'dashboard' })
        : '',
    }))
  }

  const saveEdit = async () => {
    if (!state.tempName.trim()) {
      setState((prev) => ({
        ...prev,
        nameError: t('courseOverview.card.nameRequired', { ns: 'dashboard' }),
      }))
      return
    }

    if (
      type === 'edit' &&
      'isDraft' in props &&
      props.isDraft &&
      props.onSaveDraft
    ) {
      setState((prev) => ({ ...prev, saving: true }))
      try {
        props.onSaveDraft({
          name: state.tempName,
          description: state.tempDescription,
        })
      } catch {
        setState((prev) => ({ ...prev, saving: false }))
      }
    }
  }

  const cancelEdit = () => {
    if (
      type === 'edit' &&
      'isDraft' in props &&
      props.isDraft &&
      props.onCancelDraft
    ) {
      props.onCancelDraft()
    } else {
      setState({
        isEditing: false,
        tempName: course.name,
        tempDescription: course.description || '',
        nameError: '',
        saving: false,
      })
    }
  }

  const handleCardClick = () => {
    if (state.isEditing) return
    if (type === 'edit' && 'planning' in props && props.planning?.isEditing) {
      return
    }

    if (type === 'classic') {
      if (!canOpenCourse) return
      navigate(buildOrgCoursePath(orgSlug, course.uuid))
    } else if (type === 'edit') {
      props.onEdit()
    }
  }

  return (
    <Card
      key={course.uuid}
      className={cn(
        'relative transition-colors',
        (type === 'edit' && !props.planning?.isEditing) || canOpenCourse
          ? 'cursor-pointer'
          : 'cursor-not-allowed',
        (course.status === 'archived' || course.status === 'draft') &&
          'opacity-80',
      )}
      onClick={handleCardClick}
    >
      <div className={cn(headerLineHeight, colorStyles.line[lineColor])} />
      <div className='flex justify-between gap-2 mx-4 md:mx-5 mt-3'>
        <CourseStateBadge status={course.status} />
        {type === 'edit' &&
          (!props.isDraft ? (
            <div className='flex gap-2 md:gap-1.5 items-center'>
              {course.status === 'live' && (
                <CourseShareTrigger
                  courseId={course.uuid}
                  courseName={course.name}
                  orgSlug={orgSlug}
                  size='sm'
                />
              )}
              {isAnalyticsMode ? (
                <CourseExportTrigger
                  courseId={course.uuid}
                  courseName={course.name}
                  variant='card'
                />
              ) : (
                <>
                  {course.status === 'draft' && (
                    <EditBtn
                      icon={Edit}
                      onClick={(e) => {
                        e?.stopPropagation()
                        props.onEdit()
                      }}
                      aria-label={t('courseOverview.card.editAria', {
                        ns: 'dashboard',
                        name: course.name,
                      })}
                    />
                  )}
                  <CourseExportTrigger
                    courseId={course.uuid}
                    courseName={course.name}
                    variant='card'
                  />
                  <DeleteConfirmDialog
                    trigger={
                      <EditBtn
                        actionType='delete'
                        onClick={(e) => e?.stopPropagation()}
                        aria-label={t('courseOverview.card.deleteAria', {
                          ns: 'dashboard',
                          name: course.name,
                        })}
                      />
                    }
                    itemName={course.name}
                    itemType={t('courseOverview.card.deleteItemType', {
                      ns: 'dashboard',
                    })}
                    onConfirm={() => {
                      if (props.onDelete) {
                        props.onDelete()
                      }
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <EditSaveCancelButtons
              className='space-x-2'
              onSave={() => saveEdit()}
              onCancel={cancelEdit}
              saveDisabled={state.saving || !!state.nameError}
              cancelDisabled={state.saving}
              saveAriaLabel={t('courseOverview.planning.saveAriaLabel', {
                ns: 'dashboard',
              })}
            />
          ))}
      </div>

      <div className='px-4 pb-4 md:px-6 md:pb-6 pt-2 relative overflow-hidden flex-1 flex flex-col justify-between'>
        <CardContent>
          {state.isEditing ? (
            <div className='space-y-1 mb-2 md:mb-3'>
              <Textarea
                value={state.tempName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => handleSaveOnEnter(e, saveEdit, cancelEdit)}
                className={cn(
                  'font-semibold text-base sm:text-lg lg:text-xl overflow-hidden flex items-center sm:py-1.8 placeholder:pt-1',
                  state.nameError && 'border-destructive',
                )}
                minRows={1}
                maxRows={3}
                placeholder={t('courseOverview.card.namePlaceholder', {
                  ns: 'dashboard',
                })}
                disabled={state.saving}
              />
              {state.nameError && (
                <p className='text-xs text-destructive'>{state.nameError}</p>
              )}
            </div>
          ) : (
            <CardTitle className='mb-2 md:mb-4'>{course.name}</CardTitle>
          )}

          {state.isEditing ? (
            <Textarea
              value={state.tempDescription}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const capitalizedValue = handleCapitalizedInput(
                  e.target.value,
                  state.tempDescription,
                )
                setState((prev) => ({
                  ...prev,
                  tempDescription: capitalizedValue,
                }))
              }}
              onKeyDown={(e) => handleSaveOnEnter(e, saveEdit, cancelEdit)}
              className='mb-2 md:mb-3 text-xs sm:text-sm md:text-sm lg:text-sm sm:py-1.8'
              minRows={2}
              maxRows={4}
              placeholder={t('courseOverview.card.descriptionPlaceholder', {
                ns: 'dashboard',
              })}
              disabled={state.saving}
            />
          ) : (
            !isAnalyticsMode && (
              <CardDescription className='mb-2 md:mb-4 line-clamp-3'>
                {truncateDescription(course.description ?? '')}
              </CardDescription>
            )
          )}
        </CardContent>

        <CardFooter className='flex-col items-start gap-2'>
          {type === 'classic' && (
            <div className='flex justify-between w-full items-center'>
              <CardDate course={course} state={course.status} />
              <Button
                variant={'grid'}
                size={'grid'}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(buildOrgCoursePath(orgSlug, course.uuid))
                }}
                className={cn(
                  'bg-linear-to-br',
                  colorStyles.bg[courseColor],
                  colorStyles.text[courseColor],
                )}
                disabled={!canOpenCourse}
              >
                <span className='font-semibold'>
                  {t('actions.view', { ns: 'courses' })}
                </span>
              </Button>
            </div>
          )}

          {type === 'edit' && (
            <>
              {!('isDraft' in props && props.isDraft) &&
                !state.isEditing &&
                isAnalyticsMode && (
                  <AnalyticsSection
                    score={averageQuizScore}
                    completions={overviewCompletions}
                    modules={overviewModulesCount}
                    activeModules={overviewActiveModulesCount}
                    materials={overviewMaterialsCount}
                    quizzes={overviewQuizzesCount}
                    materialDownloads={overviewDownloadCount}
                    materialCopies={overviewCopyCount}
                    materialOpens={overviewOpenCount}
                    attention={attentionParts}
                    isLoading={overviewLoading}
                    isError={overviewError}
                  />
                )}
              {!isAnalyticsMode && (
                <CoursePlanningSection
                  course={course}
                  isDraft={'isDraft' in props && props.isDraft}
                  state={course.status}
                  planning={props.planning}
                  rightActions={
                    !('isDraft' in props && props.isDraft) &&
                    !state.isEditing &&
                    !props.planning?.isEditing &&
                    props.onStatusChange ? (
                      <StatusActionButtons
                        className='flex-wrap justify-end'
                        currentStatus={course.status}
                        courseColor={courseColor}
                        onStatusChange={(newStatus) =>
                          props.onStatusChange!(course.uuid, newStatus)
                        }
                        onCopyAsDraft={() => {
                          props.onCopyAsDraft?.(course)
                        }}
                      />
                    ) : undefined
                  }
                />
              )}
            </>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}

export default CourseComponent
