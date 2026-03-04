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
import { colorStyles, colors } from '@/lib/constants'
import type {
  CourseDashboardAnalytics,
  CourseStatus,
  CourseSummary,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'
import type { CoursePlanningState } from '@/pages/CoursesPage/components/CardDate'
import { useQuery } from '@tanstack/react-query'
import { Edit } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMediaQuery } from 'usehooks-ts'
import { truncateDescription } from '../../pages/CoursePage/utils/helperFunctions'
import CardDate from '../../pages/CoursesPage/components/CardDate'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import DeleteConfirmDialog from '../ui/AlertDialog'
import { Textarea } from '../ui/textarea'
import CoursePlanningSection from './CoursePlanningSection'
import { CourseStateBadge } from './CourseStateBadge'
import EditSaveCancelButtons from './EditSaveCancelButtons'
import AnalyticsSection from './Statistics/StatisticsCourseSesction'
import { StatusActionButtons } from './StatusActionButtons'

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

// ─── Course component ─────────────────────────────────────────────────────────

const CourseComponent = (props: CourseCompProps) => {
  const { course, index, type } = props
  const isLg = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
  const courseColor = colors[index % (isLg ? 3 : 2)]

  const [state, setState] = useState({
    isEditing: type === 'edit' && 'isDraft' in props ? props.isDraft : false,
    tempName: course.name || '',
    tempDescription: course.description || '',
    nameError: '',
    saving: false,
  })

  const isEditableCourseCard =
    type === 'edit' && !('isDraft' in props && props.isDraft)
  const canShowAnalytics =
    course.status === 'live' ||
    course.status === 'paused' ||
    course.status === 'archived'
  const isAnalyticsMode =
    type === 'edit' && Boolean(props.statisticsMode) && canShowAnalytics

  const {
    data: overviewCourse,
    isLoading: overviewLoading,
    isError: overviewError,
  } = useQuery<CourseDashboardAnalytics>({
    queryKey: ['course-dashboard-analytics', course.uuid],
    queryFn: () => getCourseDashboardAnalytics(course.uuid),
    enabled:
      isEditableCourseCard &&
      isAnalyticsMode &&
      !state.isEditing &&
      canShowAnalytics,
    staleTime: 1000 * 20,
  })

  const averageQuizScore = overviewCourse?.averageQuizPercentage ?? null
  const overviewModulesCount = overviewCourse?.modulesCount ?? 0
  const overviewMaterialsCount = overviewCourse?.materialsCount ?? 0
  const overviewQuizzesCount = overviewCourse?.quizzesCount ?? 0
  const overviewCompletions =
    overviewCourse?.modules.reduce((sum, m) => sum + m.quizAttempts, 0) ?? 0
  const modulesWithoutInteraction =
    overviewCourse?.modulesWithoutInteraction ?? 0
  const quizzesWithoutSubmits = overviewCourse?.quizzesWithoutSubmits ?? 0
  const lowScoreQuizzes = overviewCourse?.lowScoreQuizzes ?? 0

  const attentionParts: string[] = []
  if (modulesWithoutInteraction > 0) {
    attentionParts.push(`Moduly bez interakcí: ${modulesWithoutInteraction}`)
  }
  if (modulesWithoutInteraction === 0 && quizzesWithoutSubmits > 0) {
    attentionParts.push(`Kvízy bez submitu: ${quizzesWithoutSubmits}`)
  }
  if (lowScoreQuizzes > 0) {
    attentionParts.push(`Kvízy s nízkým skóre: ${lowScoreQuizzes}`)
  }

  const handleNameChange = (name: string) => {
    const capitalizedName = handleCapitalizedInput(name, state.tempName)
    setState((prev) => ({
      ...prev,
      tempName: capitalizedName,
      nameError: !capitalizedName.trim() ? 'Název je povinný' : '',
    }))
  }

  const saveEdit = async () => {
    if (!state.tempName.trim()) {
      setState((prev) => ({ ...prev, nameError: 'Název je povinný' }))
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
      } catch (err) {
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
    if (type === 'edit' && 'planning' in props && props.planning?.isEditing)
      return

    if (type === 'classic') {
      if (course.status !== 'live') return
      navigate(`/courses/${course.uuid}`)
    } else if (type === 'edit') {
      props.onEdit()
    }
  }

  return (
    <Card
      key={course.uuid}
      className={cn(
        'relative transition-colors',
        ((type === 'edit' && !props.planning?.isEditing) ||
          course.status === 'live') &&
          'cursor-pointer',
        (course.status === 'draft' || course.status === 'archived') &&
          'opacity-70',
      )}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'h-2 bg-linear-to-r',
          colorStyles.gradient[courseColor],
          course.status === 'live' && 'animate-pulse',
        )}
      />

      <div className='flex justify-between gap-2 mx-4 md:mx-5 mt-3'>
        <CourseStateBadge status={course.status} />
        {type === 'edit' &&
          (!props.isDraft ? (
            <div className='flex gap-2 md:gap-1.5 items-center'>
              {isAnalyticsMode ? (
                <EditBtn
                  type='view'
                  onClick={(e) => {
                    e?.stopPropagation()
                    props.onEdit()
                  }}
                  aria-label={`View course ${course.name}`}
                />
              ) : (
                <>
                  {course.status === 'draft' ? (
                    <EditBtn
                      icon={Edit}
                      onClick={(e) => {
                        e?.stopPropagation()
                        props.onEdit()
                      }}
                      aria-label={`Edit course ${course.name}`}
                    />
                  ) : (
                    <EditBtn
                      type='view'
                      onClick={(e) => {
                        e?.stopPropagation()
                        props.onEdit()
                      }}
                      aria-label={`View course ${course.name}`}
                    />
                  )}
                  <DeleteConfirmDialog
                    trigger={
                      <EditBtn
                        type='delete'
                        onClick={(e) => e?.stopPropagation()}
                        aria-label={`Delete course ${course.name}`}
                      />
                    }
                    itemName={course.name}
                    itemType='kurz'
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
              saveAriaLabel='Save course'
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
                className={cn(
                  'font-semibold text-base sm:text-lg lg:text-xl overflow-hidden flex items-center sm:py-1.8 placeholder:pt-1',
                  state.nameError && 'border-destructive',
                )}
                minRows={1}
                maxRows={3}
                placeholder='Název kurzu'
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
              className='mb-2 md:mb-3 text-xs sm:text-sm md:text-sm lg:text-sm sm:py-1.8'
              minRows={2}
              maxRows={4}
              placeholder='Popis kurzu (volitelné)'
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
                  navigate(`/courses/${course.uuid}`)
                }}
                className={cn(
                  'bg-linear-to-br',
                  colorStyles.bg[courseColor],
                  colorStyles.text[courseColor],
                )}
                disabled={course.status !== 'live'}
              >
                <span className='font-semibold'>Zobrazit</span>
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
                    materials={overviewMaterialsCount}
                    quizzes={overviewQuizzesCount}
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
