import {
  getCourses,
  getFeedForCourse,
  getMaterialsForCourse,
  getQuizzesForCourse,
} from '@/api/queries'
import EditBtn from '@/components/shared/EditBtn'
import Feed from '@/components/shared/Feed'
import FormField from '@/components/shared/FormField'
import MaterialCard from '@/components/shared/Material'
import StateComp from '@/components/shared/StateComp'
import TabButton from '@/components/shared/TabButton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CourseSummary, FeedItem, Material, Quiz } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  Edit,
  FileText,
  MessageSquare,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { colorStyles } from '@/lib/constants'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DetailHeader from './components/DetailHeader'

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // Active tab derived from URL hash (no local state to avoid synchronous setState in effects)
  const activeTab = location.hash.replace('#', '') || 'details'

  // Form state for details
  const [courseName, setCourseName] = useState('')
  const [courseDescription, setCourseDescription] = useState('')

  // Fetch the specific course
  const {
    data: courses = [],
    isError: courseError,
    refetch: refetchCourse,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const selectedCourse = courses.find((c) => c.uuid === courseId) || null

  // Update form when course loads
  useEffect(() => {
    if (!selectedCourse) return

    // Defer updates to avoid calling setState synchronously inside the effect
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setCourseName(selectedCourse.name || '')
      setCourseDescription(selectedCourse.description || '')
    })

    return () => {
      cancelled = true
    }
  }, [selectedCourse])

  // activeTab is derived from location.hash so no effect is required to keep it in sync

  const {
    data: materials = [],
    isError: materialsError,
    refetch: refetchMaterials,
  } = useQuery<Material[] | null>({
    queryKey: ['materials', courseId],
    queryFn: () => getMaterialsForCourse(courseId!),
    enabled: Boolean(courseId) && activeTab === 'materials',
  })

  const {
    data: quizzes = [],
    isError: quizzesError,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null>({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzesForCourse(courseId!),
    enabled: Boolean(courseId) && activeTab === 'quizzes',
  })

  const {
    data: feed = [],
    isError: feedError,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null>({
    queryKey: ['feed', courseId],
    queryFn: () => getFeedForCourse(courseId!),
    enabled: Boolean(courseId) && activeTab === 'feed',
  })

  const handleTabChange = (tab: string) => {
    navigate(`/dashboard/${courseId}#${tab}`)
  }

  const handleSaveDetails = () => {
    // TODO: Implement save logic
    console.log('Saving:', { courseName, courseDescription })
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
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6 mb-3 lg:mb-6'>
        <div className='flex gap-3 flex-wrap sm:flex-nowrap justify-center md:flex-1 mt-4'>
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
            <div className='p-4 lg:p-6'>
              <CardTitle>
                <Label variant='title' size='lg'>
                  Detaily kurzu
                </Label>
              </CardTitle>

              <CardContent className='space-y-4 mt-5'>
                {/* Course Name */}

                <CardDescription className='flex flex-col gap-2'>
                  <FormField
                    label='Název kurzu'
                    inputProps={{
                      value: courseName,
                      onChange: (e) => setCourseName(e.target.value),
                      type: 'text',
                      placeholder: 'Název kurzi',
                    }}
                  />
                  {/* Course Description */}
                  <FormField
                    label='Popis kurzu'
                    multiline
                    textareaProps={{
                      value: courseDescription,
                      onChange: (e) => setCourseDescription(e.target.value),
                      placeholder: 'Zadejte popis kurzu',
                    }}
                  />
                </CardDescription>
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
                    onClick={handleSaveDetails}
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
            <Feed feed={feed} type='edit' />
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
                <div
                  key={quiz.uuid}
                  className='bg-background rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <Label variant='title' size='md' className='mb-3'>
                        {quiz.title}
                      </Label>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <div className='text-sm text-gray-600 mb-1'>
                            Otázky
                          </div>
                          <div className='text-2xl font-bold text-gray-900'>
                            {quiz.questions.length}
                          </div>
                        </div>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <div className='text-sm text-gray-600 mb-1'>
                            Pokusy
                          </div>
                          <div className='text-2xl font-bold text-blue-600'>
                            {quiz.attemptsCount}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2 ml-4'>
                      <EditBtn icon={Edit} />
                      <EditBtn icon={BarChart3} />
                      <EditBtn
                        icon={Trash2}
                        bgColor='destructive'
                        classNameBtn='hover:bg-destructive/10'
                      />
                    </div>
                  </div>
                </div>
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
