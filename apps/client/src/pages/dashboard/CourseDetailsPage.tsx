import {
  getFeedForCourse,
  getMaterialsForCourse,
  getQuizzesForCourse,
  getCourses,
} from '@/api/queries'
import Feed from '@/components/shared/Feed'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { CourseSummary, FeedItem, Material, Quiz } from '@/lib/schemas'
import { formatFileSize } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  Edit,
  FileText,
  Link2,
  Plus,
  Send,
  Trash2,
  Upload,
  BookOpen,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import StateComp from '@/components/shared/StateComp'
import EditBtn from '@/components/shared/EditBtn'
import TabButton from '@/components/shared/TabButton'

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
    <div className='max-w-7xl mx-auto px-4'>
      {/* Navigation - Tabs */}
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6 mb-6'>
        <div className='flex gap-3 flex-wrap sm:flex-nowrap justify-start md:justify-center md:flex-1'>
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
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <Label variant='title' size='lg' className='mb-6'>
              Detaily kurzu
            </Label>

            <div className='space-y-4'>
              {/* Course Name */}
              <div>
                <Label className='mb-2 block text-gray-700 font-medium'>
                  Název kurzu
                </Label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder='Zadejte název kurzu'
                  className='w-full'
                />
              </div>

              {/* Course Description */}
              <div>
                <Label className='mb-2 block text-gray-700 font-medium'>
                  Popis kurzu
                </Label>
                <Input
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder='Zadejte popis kurzu'
                  className='w-full'
                />
              </div>

              {/* Metadata (Read-only) */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t'>
                <div>
                  <Label className='text-sm text-gray-600 mb-1 block'>
                    Datum vytvoření
                  </Label>
                  <p className='text-gray-900 font-medium'>
                    {selectedCourse.createdAt
                      ? new Date(selectedCourse.createdAt).toLocaleDateString(
                          'cs-CZ',
                        )
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600 mb-1 block'>
                    Poslední úprava
                  </Label>
                  <p className='text-gray-900 font-medium'>
                    {selectedCourse.updatedAt
                      ? new Date(selectedCourse.updatedAt).toLocaleDateString(
                          'cs-CZ',
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className='flex justify-end pt-4'>
                <Button
                  variant='primary'
                  size='primary'
                  onClick={handleSaveDetails}
                >
                  Uložit změny
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <Label variant='title' size='lg'>
                  Materiály kurzu
                </Label>
                <p className='text-gray-600 mt-1 font-medium'>
                  {selectedCourse.name}
                </p>
              </div>
              <div className='flex gap-3'>
                <Button variant='primary' size='primary'>
                  <Upload className='w-5 h-5' />
                  Nahrát soubor
                </Button>
                <Button variant='secondary' size='md'>
                  <Link2 className='w-5 h-5' />
                  Přidat odkaz
                </Button>
              </div>
            </div>
          </div>

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
                <div
                  key={material.uuid}
                  className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4 flex-1'>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          material.type === 'file'
                            ? 'bg-blue-100'
                            : 'bg-teal-100'
                        }`}
                      >
                        {material.type === 'file' ? (
                          <FileText className='w-6 h-6 text-blue-600' />
                        ) : (
                          <Link2 className='w-6 h-6 text-teal-600' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <Label variant='title' size='md' className='mb-1'>
                          {material.name}
                        </Label>
                        <p className='text-gray-600 mb-2'>
                          {material.description}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          {material.type === 'file' && (
                            <>
                              <span>{material.mimeType}</span>
                              <span>•</span>
                              <span>{formatFileSize(material.sizeBytes)}</span>
                            </>
                          )}
                          {material.type === 'url' && (
                            <a
                              href={material.url}
                              className='text-blue-600 hover:underline'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              {material.url}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <EditBtn icon={Edit} />
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
          {!materialsError && (!materials || materials.length === 0) && (
            <StateComp type='no-content' message='Zatím žádné materiály' />
          )}
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <Label variant='title' size='lg'>
                  Informační kanál
                </Label>
                <p className='text-gray-600 mt-1 font-medium'>
                  {selectedCourse.name}
                </p>
              </div>
              <Button variant='primary' size='primary'>
                <Send className='w-5 h-5' />
                Nový příspěvek
              </Button>
            </div>
          </div>

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
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <Label variant='title' size='lg'>
                  Kvízy kurzu
                </Label>
                <p className='text-gray-600 mt-1 font-medium'>
                  {selectedCourse.name}
                </p>
              </div>
              <Button variant='primary' size='primary'>
                <Plus className='w-5 h-5' />
                Vytvořit kvíz
              </Button>
            </div>
          </div>

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
                  className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
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
