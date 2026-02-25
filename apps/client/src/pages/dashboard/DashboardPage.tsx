import {
  cloneCourse,
  getCourses,
  updateCourse,
} from '@/api/queries/courseQueries'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import HintPageText from '@/components/shared/HintPageText'
import FilterDropdown from '@/components/shared/FilterDropdown'
import { Button } from '@/components/ui/button'
import {
  defaultStatusFilters,
  statusFilterItems,
  type FilterIds,
} from '@/lib/constants'
import type { CourseStatus, CourseSummary } from '@/lib/schemas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpenText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import {
  filterCourses,
  formatDateTimeLocal,
  sortCoursesByFilter,
  toDateTimeLocalValue,
} from '../CoursePage/utils/helperFunctions'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'
import { toast } from 'sonner'
import { useTitle } from '@/lib/dynamicTitleHook'
import {
  useCloneCourseMutation,
  useCreateCourseMutation,
  useDeleteCourseMutation,
} from '../CoursePage/utils/useCourseMutation'
import { useMediaQuery } from 'usehooks-ts'
import { filterItems } from '@/lib/constants'
import { useDashboardCoursesSSE } from '@/api/useDashboardCoursesSSE'

const DashboardDesign1 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterIds>('newest')
  const [statusFilters, setStatusFilters] =
    useState<Record<CourseStatus, boolean>>(defaultStatusFilters)
  const [courseDraft, setCourseDraft] = useState<CourseSummary | null>(null)
  const [displayCount, setDisplayCount] = useState(9)

  const [planningCourseId, setPlanningCourseId] = useState<string | null>(null)
  const [planningDateTime, setPlanningDateTime] = useState('')
  const [planningNeedsStatusUpdate, setPlanningNeedsStatusUpdate] =
    useState(false)
  const [planningError, setPlanningError] = useState('')
  const [planningSaving, setPlanningSaving] = useState(false)
  const isMd = useMediaQuery('(min-width: 768px)')

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  })

  const { mutateAsync: deleteCourseMutation } = useDeleteCourseMutation()
  const { mutateAsync: createCourseMutation } =
    useCreateCourseMutation(setCourseDraft)
  const { mutateAsync: cloneCourseMutation } = useCloneCourseMutation()

  const invalidateCourseQueries = (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['courses-user'] })
    queryClient.invalidateQueries({ queryKey: ['course', courseId] })
  }
  const { isConnected } = useDashboardCoursesSSE()

  const closePlanningEditor = () => {
    setPlanningCourseId(null)
    setPlanningDateTime('')
    setPlanningNeedsStatusUpdate(false)
    setPlanningError('')
    setPlanningSaving(false)
  }

  const openPlanningEditor = (
    course: CourseSummary,
    needsStatusUpdate: boolean,
  ) => {
    const existingValue = toDateTimeLocalValue(course.scheduledFor)
    const defaultDate = new Date()
    defaultDate.setHours(defaultDate.getHours() + 1)
    const defaultValue = formatDateTimeLocal(defaultDate)

    setPlanningCourseId(course.uuid)
    setPlanningDateTime(existingValue || defaultValue)
    setPlanningNeedsStatusUpdate(needsStatusUpdate)
    setPlanningError('')
    setPlanningSaving(false)
  }

  const handlePlanningConfirm = async () => {
    if (!planningCourseId) {
      return
    }

    if (!planningDateTime) {
      setPlanningError('Vyberte datum a čas')
      return
    }

    const selectedDate = new Date(planningDateTime)
    if (Number.isNaN(selectedDate.getTime())) {
      setPlanningError('Neplatný formát data')
      return
    }

    const now = new Date()
    if (selectedDate <= now) {
      setPlanningError('Datum musí být v budoucnosti')
      return
    }

    setPlanningSaving(true)

    try {
      const payload = planningNeedsStatusUpdate
        ? {
            status: 'planned' as CourseStatus,
            scheduledFor: selectedDate.toISOString(),
          }
        : { scheduledFor: selectedDate.toISOString() }

      await updateCourse(planningCourseId, payload)
      invalidateCourseQueries(planningCourseId)

      toast.success(
        planningNeedsStatusUpdate
          ? 'Kurz byl naplánován'
          : 'Termín kurzu byl změněn',
      )

      closePlanningEditor()
    } catch (error) {
      setPlanningSaving(false)
      toast.error('Nepodařilo se uložit termín kurzu')
    }
  }

  const handleStatusChange = async (
    courseId: string,
    newStatus: CourseStatus,
  ) => {
    const statusMessages: Record<CourseStatus, string> = {
      draft: 'Kurz byl převeden do návrhu',
      planned: 'Kurz byl naplánován',
      live: 'Kurz byl spuštěn',
      paused: 'Kurz byl pozastaven',
      archived: 'Kurz byl archivován',
    }

    if (newStatus === 'planned') {
      const course = courses.find((item) => item.uuid === courseId)
      if (!course) {
        toast.error('Kurz nebyl nalezen')
        return
      }

      openPlanningEditor(course, true)
      return
    }

    closePlanningEditor()

    try {
      await updateCourse(courseId, { status: newStatus })
      invalidateCourseQueries(courseId)
      toast.success(statusMessages[newStatus])
    } catch (error) {
      toast.error('Nepodařilo se změnit stav kurzu')
    }
  }

  const searchFilteredCourses = filterCourses(courses, searchQuery)
  const filteredCourses = searchFilteredCourses.filter(
    (course) => statusFilters[course.status],
  )
  const sortedCourses = sortCoursesByFilter(filteredCourses, selectedFilter)

  const hasMoreCourses = sortedCourses.length > displayCount
  const displayedCourses = sortedCourses.slice(0, displayCount)

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const resetStatusFilters = () => {
    setStatusFilters({ ...defaultStatusFilters })
  }

  const handleEditCourse = (course: CourseSummary) => {
    // navigate(`/dashboard/${course.uuid}#details`)
    navigate(`/dashboard/${course.uuid}`)
  }

  const handleAddCourse = () => {
    const newDraft: CourseSummary = {
      uuid: 'testid',
      name: '',
      description: '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCourseDraft(newDraft)
  }

  const createButton = (mobile?: boolean) => (
    <Button
      variant='primary'
      size='grid'
      className={mobile ? 'px-3 shrink-0' : ''}
      onClick={handleAddCourse}
      aria-label='Vytvořit kurz'
    >
      <Plus className='w-5 h-5' aria-hidden='true' />
      {!mobile && <span className='whitespace-nowrap'>Vytvořit kurz</span>}
    </Button>
  )

  useTitle('Správa kurzů')

  const isSearchEmpty = searchQuery.trim() === ''
  const useResetStatusAction = isSearchEmpty && courses.length > 0
  return (
    <>
      <div className='max-w-7xl mx-auto md:px-4'>
        <div className='space-y-6 pt-3'>
          <div className='flex flex-row justify-center items-center'>
            <HintPageText
              text='Správa kurzů'
              icon={BookOpenText}
              spanText={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='hidden lg:inline-flex'
            />
            <FilterDropdown
              items={filterItems}
              selectedValue={selectedFilter}
              onSelect={setSelectedFilter}
              statusCheckboxes={statusFilterItems.map((item) => ({
                label: item.label,
                value: item.value,
                checked: statusFilters[item.value],
                onCheckedChange: (checked) => {
                  setStatusFilters((prev) => ({
                    ...prev,
                    [item.value]: checked,
                  }))
                },
              }))}
              align={isMd ? 'center' : 'start'}
              width='w-35 md:w-40'
            />
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              count={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='flex-1 lg:flex-initial'
            />
            <span className='lg:hidden ml-3'>{createButton(true)}</span>
            <span className='hidden lg:inline ml-3'>{createButton(false)}</span>
          </div>

          {coursesLoading ? (
            <CoursesPageSceleton />
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6 lg:mt-7'>
                {courseDraft && (
                  <CourseComponent
                    key={courseDraft.uuid}
                    course={courseDraft}
                    index={0}
                    type='edit'
                    isDraft
                    onSaveDraft={async (data) => {
                      createCourseMutation(data)
                    }}
                    onEdit={() => {
                      handleEditCourse(courseDraft)
                    }}
                    onCancelDraft={() => setCourseDraft(null)}
                  />
                )}

                {displayedCourses.map((course, index) => {
                  const isPlanningForCourse = planningCourseId === course.uuid
                  const planning = {
                    editable: course.status === 'planned',
                    isEditing: isPlanningForCourse,
                    value: isPlanningForCourse ? planningDateTime : '',
                    error: isPlanningForCourse ? planningError : '',
                    saving: isPlanningForCourse && planningSaving,
                    onOpen: () => openPlanningEditor(course, false),
                    onChange: (value: string) => {
                      setPlanningDateTime(value)
                      if (planningError) {
                        setPlanningError('')
                      }
                    },
                    onConfirm: handlePlanningConfirm,
                    onCancel: closePlanningEditor,
                  }
                  return (
                    <CourseComponent
                      key={
                        course.uuid ?? (course as CourseSummary).uuid ?? index
                      }
                      course={course}
                      index={courseDraft ? index + 1 : index}
                      type='edit'
                      onEdit={() => {
                        handleEditCourse(course)
                      }}
                      onDelete={() => deleteCourseMutation(course.uuid)}
                      onStatusChange={handleStatusChange}
                      planning={planning}
                      onCopyAsDraft={async (source: CourseSummary) => {
                        cloneCourseMutation({ source })
                      }}
                    />
                  )
                })}
              </div>

              {hasMoreCourses && (
                <div className='mt-8 text-center'>
                  <Button
                    variant='primary'
                    size='primary'
                    onClick={loadMoreCourses}
                    aria-label='Načíst další kurzy'
                  >
                    Načíst další kurzy
                  </Button>
                </div>
              )}
            </>
          )}

          {!courseDraft &&
            (!coursesLoading && !coursesError && courses.length === 0 ? (
              <StateComp
                type='no-content'
                message='Začněte vytvořením svého prvního kurzu'
              />
            ) : coursesError ? (
              <StateComp
                type='error'
                onAction={() => refetchCourses()}
                message='Nepodařilo se načíst kurzy'
              />
            ) : (
              filteredCourses.length === 0 &&
              !coursesLoading && (
                <StateComp
                  type='empty-search'
                  onAction={() => {
                    if (useResetStatusAction) {
                      resetStatusFilters()
                      return
                    }
                    setSearchQuery('')
                  }}
                  actionText={
                    useResetStatusAction ? 'Zrušit filtry' : undefined
                  }
                />
              )
            ))}
        </div>
      </div>
    </>
  )
}

export default DashboardDesign1
