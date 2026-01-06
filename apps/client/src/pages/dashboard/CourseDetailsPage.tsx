import { getCourses, updateCourse } from '@/api/queries/courseQueries'
import { getFeed } from '@/api/queries/feedQueries'
import { getMaterials } from '@/api/queries/materialQueries'
import { getQuizzes } from '@/api/queries/quizQueries'
// import Feed from '@/components/shared/Feed'
import FeedItemComp from '@/components/shared/FeedItemComp'
import FormField from '@/components/shared/FormField'
import MaterialCard from '@/components/shared/Material'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import TabButton from '@/components/shared/TabButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorStyles } from '@/lib/constants'
import type { CourseSummary, FeedItem, Material, Quiz } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DetailHeader from './components/DetailHeader'
import Breadcrumb from '@/components/shared/Breadcrumb'

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = location.hash.replace('#', '') || 'details'

  const {
    data: courses = [],
    isError: courseError,
    refetch: refetchCourse,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })
  const selectedCourse = courses.find((c) => c.uuid === courseId) || null
  const [courseDetails, setCourseDetails] = useState({
    name: selectedCourse?.name || '',
    description: selectedCourse?.description || '',
  })

  const {
    data: materials = [],
    isError: materialsError,
    refetch: refetchMaterials,
  } = useQuery<Material[] | null>({
    queryKey: ['materials', courseId],
    queryFn: () => getMaterials(courseId!),
    enabled: Boolean(courseId) && activeTab === 'materials',
  })

  const {
    data: quizzes = [],
    isError: quizzesError,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null>({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzes(courseId!),
    enabled: Boolean(courseId) && activeTab === 'quizzes',
  })

  const {
    data: feed = [],
    isError: feedError,
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

  if (!selectedCourse) {
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
        <div className='flex gap-3 flex-wrap sm:flex-nowrap justify-center md:flex-1'>
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
          <Card className='bg-background rounded-xl shadow-md hover:shadow-md hover:scale-100 hover:translate-0 overflow-hidden'>
            <div
              className={`h-2 bg-linear-to-r ${colorStyles.gradient['accent-teal']}`}
            />

            <div className='p-4 lg:p-6 -mt-2'>
              <Breadcrumb
                items={[
                  { label: 'Sprava kurzů', path: '/dashboard' },
                  { label: 'Detaily kurzu' },
                ]}
                className='mb-2'
              />
              <CardTitle>
                <Label variant='title' size='lg'>
                  Detaily kurzu
                </Label>
              </CardTitle>

              <CardContent className='space-y-4 mt-5'>
                {/* Course Name */}

                <div className='flex flex-col gap-2'>
                  <FormField
                    label='Název kurzu'
                    inputProps={{
                      value: courseDetails.name,
                      onChange: (e) =>
                        setCourseDetails((prev) => ({
                          name: e.target.value,
                          description: prev.description,
                        })),
                      type: 'text',
                      placeholder: 'Název kurzu',
                    }}
                  />
                  {/* Course Description */}
                  <FormField
                    label='Popis kurzu'
                    multiline
                    textareaProps={{
                      value: courseDetails.description,
                      onChange: (e) =>
                        setCourseDetails((prev) => ({
                          name: prev.name,
                          description: e.target.value,
                        })),
                      placeholder: 'Zadejte popis kurzu',
                    }}
                  />
                </div>
                {/* Metadata (Read-only) */}
                <CardFooter className='flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center gap-4 pt-4 '>
                  <div className='flex flex-row gap-10'>
                    <div>
                      <Label size={'sm'} className='mb-2'>
                        Datum vytvoření
                      </Label>
                      <p className='text-gray-900 font-medium'>
                        {selectedCourse.createdAt
                          ? new Date(
                              selectedCourse.createdAt,
                            ).toLocaleDateString('cs-CZ')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label size={'sm'} className='mb-2'>
                        Poslední úprava
                      </Label>
                      <p className='text-gray-900 font-medium'>
                        {selectedCourse.updatedAt
                          ? new Date(
                              selectedCourse.updatedAt,
                            ).toLocaleDateString('cs-CZ')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='primary'
                    size='primary'
                    onClick={() => {
                      updateCourse(selectedCourse.uuid, courseDetails)
                    }}
                    className='w-fit'
                  >
                    Uložit změny
                  </Button>
                </CardFooter>
              </CardContent>
            </div>
          </Card>
        </>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className='space-y-6'>
          <DetailHeader
            onButtonClick={() => {
              console.log('зробити матеріал')
            }}
            title='Materiály kurzu'
            gradient='accent-teal'
            buttonText='Přidat podklad'
          />

          {/* Error State */}
          {materialsError && (
            <StateComp
              type='error'
              onAction={() => refetchMaterials()}
              message='Nepodařilo se načíst materiály'
            />
          )}

          {/* Materials List */}
          {!materialsError && materials && materials.length > 0 && (
            <div className='grid gap-4'>
              {materials.map((material) => (
                <MaterialCard
                  key={material.uuid}
                  material={material}
                  type='edit'
                  onEdit={() => console.log('Edit', material.uuid)}
                  onDelete={() => console.log('Delete', material.uuid)}
                  onUpload={() => console.log('Upload', material.uuid)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!materialsError && (!materials || materials.length === 0) && (
            <StateComp type='no-content' message='Zatím žádné materiály' />
          )}
        </div>
      )}

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

          {/* Error State */}
          {feedError && (
            <StateComp
              type='error'
              onAction={() => refetchFeed()}
              message='Nepodařilo se načíst informační kanál'
            />
          )}

          {/* Feed List */}
          {!feedError && feed && feed.length > 0 && (
            <div className='bg-background rounded-xl shadow-md p-3 md:p-6'>
              <div className='space-y-4'>
                {feed.map((feedItem) => (
                  <FeedItemComp
                    feedItem={feedItem}
                    key={feedItem.uuid}
                    type='edit'
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!feedError && (!feed || feed.length === 0) && (
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

          {/* Error State */}
          {quizzesError && (
            <StateComp
              type='error'
              onAction={() => refetchQuizzes()}
              message='Nepodařilo se načíst kvízy'
            />
          )}

          {/* Quizzes List */}
          {!quizzesError && quizzes && quizzes.length > 0 && (
            <div className='grid gap-4'>
              {quizzes.map((quiz) => (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode='lecturer'
                  onSave={(updatedQuiz) => {
                    console.log('Save:', updatedQuiz)
                    // API call zde
                  }}
                  onDelete={() => {
                    console.log('Delete:', quiz.uuid)
                    // API call zde
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!quizzesError && (!quizzes || quizzes.length === 0) && (
            <StateComp type='no-content' message='Zatím žádné kvízy' />
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
