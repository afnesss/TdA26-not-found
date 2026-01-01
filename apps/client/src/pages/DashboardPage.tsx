import {
  getCourses,
  getFeedForCourse,
  getMaterialsForCourse,
  getQuizzesForCourse,
} from '@/api/queries'
import HintPageText from '@/components/shared/HintPageText'
import SearchBar from '@/components/shared/SearchBar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { FilterIds } from '@/lib/constants'
import type { CourseSummary, FeedItem, Material, Quiz } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  Edit,
  FileText,
  Link2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import CourseComp from './components/CourseComponent'
import { formatDate, formatFileSize } from './utils/helperFuntions'

const DashboardDesign1 = () => {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterIds>('all')

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const {
    data: materials = [],
    isLoading: materialsLoading,
    isError: materialsError,
    refetch: refetchMaterials,
  } = useQuery<Material[] | null>({
    queryKey: ['materials', selectedCourse?.uuid],
    queryFn: () => getMaterialsForCourse(selectedCourse!.uuid),
    enabled: Boolean(selectedCourse),
  })

  const {
    data: quizzes = [],
    isLoading: quizzesLoading,
    isError: quizzesError,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null>({
    queryKey: ['quizzes', selectedCourse?.uuid],
    queryFn: () => getQuizzesForCourse(selectedCourse!.uuid),
    enabled: Boolean(selectedCourse),
  })

  const {
    data: feed = [],
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null>({
    queryKey: ['feed', selectedCourse?.uuid],
    queryFn: () => getFeedForCourse(selectedCourse!.uuid),
    enabled: Boolean(selectedCourse),
  })
  const sortedCourses = [...courses].sort((a, b) => {
    const dateKey =
      selectedFilter === 'newest'
        ? 'createdAt'
        : selectedFilter === 'updated'
          ? 'updatedAt'
          : null

    if (!dateKey) return 0

    return new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime()
  })

  return (
    <>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Navigation - Filter Style */}
        <div className='flex  flex-wrap items-center mb-8'>
          <Label variant={'title'} size={'primary'} className='self-start'>
            Dashboard Lektora
          </Label>
          <div className='flex gap-3 lg:pl-15 justify-center'>
            <Button
              variant={'filter'}
              onClick={() => setActiveTab('courses')}
              className={`
                       ${
                         activeTab === 'courses'
                           ? 'bg-primary text-background shadow-md'
                           : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <BookOpen className='w-4 h-4' />
              Kurzy
            </Button>
            <Button
              variant={'filter'}
              onClick={() => setActiveTab('materials')}
              disabled={!selectedCourse}
              className={`
                       ${
                         activeTab === 'materials'
                           ? 'bg-primary text-background shadow-md'
                           : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <FileText className='w-4 h-4' />
              Materiály
            </Button>
            <Button
              variant={'filter'}
              onClick={() => setActiveTab('feed')}
              disabled={!selectedCourse}
              className={`
                       ${
                         activeTab === 'feed'
                           ? 'bg-primary text-background shadow-md'
                           : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <MessageSquare className='w-4 h-4' />
              Informační kanál
            </Button>
            <Button
              variant={'filter'}
              onClick={() => setActiveTab('quizzes')}
              disabled={!selectedCourse}
              className={`
                       ${
                         activeTab === 'quizzes'
                           ? 'bg-primary text-background shadow-md'
                           : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <BarChart3 className='w-4 h-4' />
              Kvízy
            </Button>
          </div>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className='space-y-6'>
            {/* Hero Section */}
            <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-between items-center'>
              <HintPageText
                text='Moje kurzy'
                icon={Sparkles}
                spanText={courses.length.toString()}
              />
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <Button variant='primary' size='primary'>
                <Plus className='w-5 h-5' />
                Vytvořit kurz
              </Button>
            </div>

            {/* Courses Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6'>
              {courses.map((course, index) => (
                <CourseComp
                  key={course.uuid ?? (course as CourseSummary).uuid ?? index}
                  course={course}
                  index={index}
                  type='edit'
                  onEdit={() => {
                    setSelectedCourse(course)
                    setActiveTab('materials')
                  }}
                />
              ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
              <div className='text-center py-12'>
                <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <Label variant='title' size='lg' className='text-gray-600 mb-2'>
                  Žádné kurzy nenalezeny
                </Label>
                <p className='text-gray-500 mb-6'>
                  Zkuste upravit vyhledávání nebo vytvořte nový kurz
                </p>
                <Button
                  variant='secondary'
                  size='md'
                  onClick={() => setSearchQuery('')}
                >
                  Vymazat vyhledávání
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && selectedCourse && (
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

            <div className='grid gap-4'>
              {materials?.map((material) => (
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
                      <Button variant='ghost' size='icon'>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='icon'>
                        <Trash2 className='w-4 h-4 text-red-500' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && selectedCourse && (
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

            <div className='bg-white rounded-xl shadow-md p-6'>
              <div className='space-y-4'>
                {feed?.map((post) => (
                  <div
                    key={post.uuid}
                    className={`p-4 rounded-lg border-l-4 ${
                      post.type === 'manual'
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              post.type === 'manual'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {post.type === 'manual'
                              ? 'Příspěvek lektora'
                              : 'Automatická událost'}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {formatDate(post.createdAt)}
                          </span>
                          {post.edited && post.updatedAt && (
                            <span className='text-xs text-gray-400 italic'>
                              (upraveno {formatDate(post.updatedAt)})
                            </span>
                          )}
                        </div>
                        <p className='text-gray-900'>{post.message}</p>
                      </div>
                      {post.type === 'manual' && (
                        <div className='flex gap-2 ml-4'>
                          <Button variant='ghost' size='icon'>
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button variant='ghost' size='icon'>
                            <Trash2 className='w-4 h-4 text-red-500' />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && selectedCourse && (
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

            <div className='grid gap-4'>
              {quizzes?.map((quiz) => (
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
                      <Button variant='ghost' size='icon'>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='icon'>
                        <BarChart3 className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='icon'>
                        <Trash2 className='w-4 h-4 text-red-500' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DashboardDesign1
