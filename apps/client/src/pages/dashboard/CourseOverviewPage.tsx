import { getCourseById, updateCourse } from '@/api/queries/courseQueries'
import { updateModule } from '@/api/queries/moduleQueries'
import {
  CourseStateBadge,
  type CourseStatus,
} from '@/components/shared/CourseStateBadge'
import { StatusActionButtons } from '@/components/shared/StatusActionButtons'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import DeleteConfirmDialog from '@/components/ui/AlertDialog'
import { Button } from '@/components/ui/button'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { colorStyles } from '@/lib/constants'
import type { CourseDetail } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { useUpdateCourseMutation } from '@/pages/CoursePage/utils/useCourseMutation'
import { useDeleteModuleMutation } from '@/pages/CoursePage/utils/useModuleMutation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCourseModulesLayoutContext } from './CourseModulesLayoutContext'
import DashboardAddButton from './components/DashboardAddButton'
import EditableDetailCard from './components/EditableDetailCard'
import EditBtn from './components/EditBtn'
import ModuleVisibilityActionButton from './components/ModuleVisibilityActionButton'

type QueryError = Error & { status?: number }

const CourseModulesOverviewPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { courseId, previewMode, courseMeta } = useCourseModulesLayoutContext()
  const [courseName, setCourseName] = useState(courseMeta.name)
  const [courseDescription, setCourseDescription] = useState(
    courseMeta.description ?? '',
  )

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
            <DashboardAddButton label='Přidat modul' className='rounded-full' />
          )}
        </div>

        {modules.length === 0 ? (
          <StateComp
            type='no-content'
            message='Kurz zatím nemá žádné moduly'
            className='pt-8'
          />
        ) : (
          <CourseModulesGrid
            modules={modules}
            onOpenModule={handleOpenModule}
            getIndexBadgeClassName={(m) =>
              courseMeta.status !== 'live'
                ? 'bg-primary/30'
                : m.status === 'active'
                  ? 'bg-secondary/60'
                  : 'bg-muted-foreground/20'
            }
            renderActions={(m) =>
              courseMeta.status !== 'draft' ? null : (
                <>
                  <EditBtn
                    icon={Edit}
                    onClick={(e) => {
                      e?.stopPropagation()
                      handleOpenModule(m.uuid)
                    }}
                    aria-label={`Edit module ${m.name}`}
                  />
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmDialog
                      itemType='modul'
                      itemName={m.name}
                      trigger={
                        <EditBtn
                          type='delete'
                          aria-label={`Delete module ${m.name}`}
                        />
                      }
                      onConfirm={() => {
                        deleteModuleMutation(m.uuid)
                      }}
                    />
                  </div>
                </>
              )
            }
            renderFooterActions={(m) => (
              <>
                {courseMeta.status !== 'draft' && (
                  <Button
                    variant={'grid'}
                    size={'sm'}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/dashboard/${courseId}/modules/${m.uuid}`)
                    }}
                    className={cn(
                      'bg-linear-to-br h-8 text-xs md:text-sm',
                      colorStyles.bg['accent-teal-dark'],
                      colorStyles.text['accent-teal-dark'],
                    )}
                  >
                    <span className='font-semibold'>Zobrazit</span>
                  </Button>
                )}
                {canToggleModuleVisibility && (
                  <ModuleVisibilityActionButton
                    status={m.status}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleModuleVisibility(m.uuid, m.status)
                    }}
                    disabled={toggleModuleVisibilityMutation.isPending}
                  />
                )}
              </>
            )}
          />
        )}
      </div>
    </>
  )
}

export default CourseModulesOverviewPage
