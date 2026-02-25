import { getCourseById } from '@/api/queries/courseQueries'
import { getFeed } from '@/api/queries/feedQueries'
import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { colorStyles } from '@/lib/constants'
import type { CourseDetail, FeedItem, StatusHistoryEvent } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { fmt } from '../CoursePage/utils/helperFunctions'
import type { CourseModulesLayoutContext } from './CourseModulesLayoutContext'

type QueryError = Error & { status?: number }

const CourseModulesLayoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [sideTab, setSideTab] = useState<'feed' | 'history'>('feed')

  const {
    data: courseMeta,
    isLoading: courseLoading,
    isError: courseError,
    error: courseQueryError,
    refetch: refetchCourse,
  } = useQuery<CourseDetail, QueryError, CourseModulesLayoutContext['courseMeta']>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: Boolean(courseId),
    networkMode: 'always',
    select: (course) => ({
      uuid: course.uuid,
      name: course.name,
      description: course.description,
      status: course.status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      status_history: course.status_history,
    }),
  })

  const {
    data: feedItems,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null, QueryError>({
    queryKey: ['course-feed', courseId],
    queryFn: () => getFeed(courseId!),
    enabled: Boolean(courseId),
    networkMode: 'always',
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  const historyItems = useMemo(
    () => courseMeta?.status_history ?? [],
    [courseMeta?.status_history],
  )

  if (!courseId) {
    return <StateComp type='not-found' message='Kurz nebyl nalezen' />
  }

  if (courseLoading) {
    return <StateComp type='no-content' message='Načítání kurzu...' />
  }

  if (courseError || !courseMeta) {
    const isNotFound = courseQueryError?.status === 404
    return (
      <StateComp
        type={isNotFound ? 'not-found' : isOffline ? 'network-offline' : 'error'}
        message={isNotFound ? 'Kurz nebyl nalezen' : undefined}
        onAction={() => refetchCourse()}
      />
    )
  }

  const previewMode = courseMeta.status !== 'draft'
  const courseIndexColor: keyof typeof colorStyles.gradient = 'accent-teal-light'

  return (
    <div className='max-w-7xl mx-auto md:px-4'>
      <div className='pt-2 space-y-5'>
        <Outlet
          context={{
            courseId,
            courseMeta,
            previewMode,
            courseIndexColor,
          }}
        />

        <Card className='border border-border/60 shadow-md bg-background'>
          <div
            className={`h-2 bg-linear-to-r ${colorStyles.gradient[courseIndexColor]}`}
          />
          <div className='p-4 md:p-5 space-y-4'>
            <div className='flex justify-between gap-3'>
              <div className='flex gap-2'>
                <Button
                  variant={sideTab === 'feed' ? 'primary' : 'outline'}
                  size='sm'
                  className='rounded-xl'
                  onClick={() => setSideTab('feed')}
                >
                  Oznámení
                </Button>
                <Button
                  variant={sideTab === 'history' ? 'primary' : 'outline'}
                  size='sm'
                  className='rounded-xl'
                  onClick={() => setSideTab('history')}
                >
                  Historie
                </Button>
              </div>
              {!previewMode && sideTab === 'feed' && (
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-xl border-dashed'
                >
                  <Plus className='size-4' />
                  Přidat příspěvek
                </Button>
              )}
            </div>

            {sideTab === 'feed' ? (
              <div className='space-y-3'>
                {feedLoading ? (
                  <StateComp
                    type='no-content'
                    message='Načítání příspěvků...'
                    className='pt-8 pb-0'
                  />
                ) : feedError ? (
                  <StateComp
                    type={isOffline ? 'network-offline' : 'error'}
                    onAction={() => refetchFeed()}
                    message={isOffline ? undefined : 'Nepodařilo se načíst příspěvky'}
                    className='pt-8 pb-0'
                  />
                ) : feedItems?.length ? (
                  feedItems.map((item) => (
                    <FeedItemComp
                      key={item.uuid}
                      feedItem={item}
                      type={previewMode ? 'classic' : 'edit'}
                      onSave={async () => Promise.resolve()}
                      onDelete={() => undefined}
                    />
                  ))
                ) : (
                  <StateComp
                    type='no-content'
                    message='Zatím žádné příspěvky'
                    className='pt-8 pb-0'
                  />
                )}
              </div>
            ) : (
              <div className='space-y-3'>
                {historyItems.length ? (
                  historyItems.map((event: StatusHistoryEvent, index) => (
                    <div
                      key={`${String(event.timestamp)}-${event.status}-${index}`}
                      className='rounded-xl border border-border/60 bg-muted/20 p-3'
                    >
                      <p className='text-sm font-semibold text-neutral-black'>
                        Stav kurzu změněn na {event.status}
                      </p>
                      {event.note && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          {event.note}
                        </p>
                      )}
                      <p className='text-[11px] text-muted-foreground mt-2'>
                        {fmt(String(event.timestamp))}
                      </p>
                    </div>
                  ))
                ) : (
                  <StateComp
                    type='no-content'
                    message='Zatím žádná historie'
                    className='pt-8 pb-0'
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CourseModulesLayoutPage
