import { getCourses } from '@/api/queries/courseQueries'
import { getFeed, updatePost } from '@/api/queries/feedQueries'
import { getQuizzes, updateQuiz } from '@/api/queries/quizQueries'
import FeedItemComp from '@/components/shared/FeedItemComp'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import TabButton from '@/components/shared/TabButton'
import type { CourseSummary, FeedItem, Material, Quiz } from '@/lib/schemas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, BookOpen, FileText, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  DetailsContentSkeleton,
  FeedContentSkeleton,
  QuizzesContentSkeleton,
} from '../../components/shared/loadingskeleton/DetailsSkeleton'
import CourseDetailsForm from './components/CourseDetailsForm'
import DetailHeader from './components/DetailHeader'
import MaterialsTab from './components/MaterialsTab'

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draftMaterial, setDraftMaterial] = useState<Material | null>(null)
  const activeTab = location.hash.replace('#', '') || 'details'

  const {
    data: courses = [],
    isError: courseError,
    isLoading: courseLoading,
    refetch: refetchCourse,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const selectedCourse = courses.find((c) => c.uuid === courseId) || null

  const {
    data: quizzes = [],
    isError: quizzesError,
    isLoading: quizzesLoading,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null>({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzes(courseId!),
    enabled: Boolean(courseId) && activeTab === 'quizzes',
  })

  const {
    data: feed = [],
    isError: feedError,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null>({
    queryKey: ['feed', courseId],
    queryFn: () => getFeed(courseId!),
    enabled: Boolean(courseId) && activeTab === 'feed',
  })

  const handleTabChange = (tab: string) => {
    navigate(`/dashboard/${courseId}#${tab}`)
  }

  if (courseError) {
    return (
      <div className='max-w-7xl mx-auto px-4'>
        <StateComp
          type='error'
          onAction={() => refetchCourse()}
          message='Nepodařilo se načíst kurz'
        />
      </div>
    )
  }

  if (!selectedCourse && !courseLoading) {
    return (
      <div className='max-w-7xl mx-auto px-4'>
        <StateComp type='no-content' message='Kurz nebyl nalezen' />
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto lg:px-4'>
      {/* Navigation - Tabs */}
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6 mb-4 lg:mb-5 mt-2'>
        <div className='flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-center md:flex-1'>
          <TabButton
            isActive={activeTab === 'details'}
            onClick={() => handleTabChange('details')}
            title='Detaily'
            icon={BookOpen}
          />
          <TabButton
            isActive={activeTab === 'materials'}
            onClick={() => handleTabChange('materials')}
            title='Materiály'
            icon={FileText}
          />
          <TabButton
            isActive={activeTab === 'quizzes'}
            onClick={() => handleTabChange('quizzes')}
            title='Kvízy'
            icon={BarChart3}
          />
          <TabButton
            isActive={activeTab === 'feed'}
            onClick={() => handleTabChange('feed')}
            title='Informační kanál'
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <>
          {courseLoading ? (
            <DetailsContentSkeleton />
          ) : (
            selectedCourse && (
              <CourseDetailsForm selectedCourse={selectedCourse} />
            )
          )}
        </>
      )}

      {activeTab === 'materials' && <MaterialsTab activeTab={activeTab} />}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className='space-y-6'>
          <DetailHeader
            onButtonClick={() => {
              console.log('зробити feed')
            }}
            title=' Informační kanál'
            gradient='accent-teal'
            buttonText='Nový příspěvek'
          />

          {feedLoading ? (
            <FeedContentSkeleton />
          ) : feedError ? (
            <StateComp
              type='error'
              onAction={() => refetchFeed()}
              message='Nepodařilo se načíst informační kanál'
            />
          ) : feed && feed.length > 0 ? (
            <div className='bg-background rounded-xl shadow-md p-2 sm:p-3 md:p-6'>
              <div className='space-y-4'>
                {feed.map((feedItem) => (
                  <FeedItemComp
                    feedItem={feedItem}
                    key={feedItem.uuid}
                    type='edit'
                    onSave={async (editedFeed) => {
                      if (courseId) {
                        await updatePost(courseId, feedItem.uuid, editedFeed)
                        queryClient.invalidateQueries({
                          queryKey: ['feed', courseId],
                        })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <StateComp type='no-content' message='Zatím žádné příspěvky' />
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className='space-y-6'>
          <DetailHeader
            onButtonClick={() => {
              console.log('зробити kviz')
            }}
            title='Kvízy kurzu'
            gradient='accent-teal'
            buttonText='Vytvořit kvíz'
          />

          {quizzesLoading ? (
            <QuizzesContentSkeleton />
          ) : quizzesError ? (
            <StateComp
              type='error'
              onAction={() => refetchQuizzes()}
              message='Nepodařilo se načíst kvízy'
            />
          ) : quizzes && quizzes.length > 0 ? (
            <div className='grid gap-4'>
              {quizzes.map((quiz) => (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode='lecturer'
                  onSave={async (updatedQuiz) => {
                    if (courseId) {
                      await updateQuiz(courseId, quiz.uuid!, updatedQuiz)
                      queryClient.invalidateQueries({
                        queryKey: ['quizzes', courseId],
                      })
                    }
                  }}
                  onDelete={() => {
                    console.log('Delete:', quiz.uuid)
                  }}
                />
              ))}
            </div>
          ) : (
            <StateComp type='no-content' message='Zatím žádné kvízy' />
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
