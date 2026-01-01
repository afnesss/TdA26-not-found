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
import CourseComponent from '../components/shared/CourseComponent'
import { formatDate, formatFileSize } from '@/lib/utils'
import TabButton from '@/components/shared/TabButton'
import EmptyStateComp from '@/components/shared/EmptyStateComp'
import Feed from '@/components/shared/Feed'

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
      <div className='max-w-7xl mx-auto px-4 py-8 '>
        {/* Navigation - Filter Style */}
        <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6 mb-4'>
          <Label
            variant='title'
            size='primary'
            className='self-startwhitespace-nowrap'
          >
            Dashboard Lektora
          </Label>

          {/* TABS */}
          <div
            className='flex gap-3 flex-wrap sm:flex-nowrap justify-start md:justify-center md:flex-1 
          lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex-nowrap'
          >
            <TabButton
              isActive={activeTab === 'courses'}
              onClick={() => setActiveTab('courses')}
              title='Kurzy'
              icon={BookOpen}
            />

            <TabButton
              isActive={activeTab === 'materials'}
              onClick={() => setActiveTab('materials')}
              title='Materiály'
              isDisabled={!selectedCourse}
              icon={FileText}
            />

            <TabButton
              isActive={activeTab === 'quizzes'}
              onClick={() => setActiveTab('quizzes')}
              title='Kvízy'
              icon={BarChart3}
              isDisabled={!selectedCourse}
            />

            <TabButton
              isActive={activeTab === 'feed'}
              onClick={() => setActiveTab('feed')}
              title='Informační kanál'
              icon={MessageSquare}
              isDisabled={!selectedCourse}
            />
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
                className='hidden lg:flex'
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
                <CourseComponent
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
            {/* {courses.length === 0 && <EmptyStateComp onClick={} />} */}
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

            {feed && <Feed feed={feed} />}
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
