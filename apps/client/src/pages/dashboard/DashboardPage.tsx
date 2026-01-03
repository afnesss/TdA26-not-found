import {
  getCourses,
  getFeedForCourse,
  getMaterialsForCourse,
  getQuizzesForCourse,
} from '@/api/queries'
import Feed from '@/components/shared/Feed'
import SearchBar from '@/components/shared/SearchBar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { FilterIds } from '@/lib/constants'
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
} from 'lucide-react'
import { useState } from 'react'
import CourseComponent from '../../components/shared/CourseComponent'
import { filterCourses } from '../CoursePage/utils/helperFunctions'
import EmptyStateComp from '@/components/shared/StateComp'
import StateComp from '@/components/shared/StateComp'
import { useNavigate } from 'react-router'

const DashboardDesign1 = () => {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

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

  const filteredCourses = filterCourses(courses, searchQuery)

  const handleEditCourse = (course: CourseSummary) => {
    navigate(`/dashboard/${course.uuid}#details`)
  }

  return (
    <>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4  '>
        {/* Navigation - Filter Style */}

        {/* Courses Tab */}

        <div className='space-y-6 pt-2'>
          {/* Hero Section */}
          <div className='flex  gap-3 md:gap-6 justify-between items-center'>
            <Label
              variant='title'
              size='primary'
              className='self-startwhitespace-nowrap'
            >
              Správa kurzů
            </Label>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <Button variant='primary' size='primary'>
              <Plus className='w-5 h-5' />
              <span className='hidden md:block'>Vytvořit kurz</span>
            </Button>
          </div>

          {/* Courses Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6'>
            {filteredCourses.map((course, index) => (
              <CourseComponent
                key={course.uuid ?? (course as CourseSummary).uuid ?? index}
                course={course}
                index={index}
                type='edit'
                onEdit={() => {
                  setSelectedCourse(course)
                  handleEditCourse(selectedCourse!)
                }}
              />
            ))}
          </div>

          {!coursesLoading && !coursesError && courses.length === 0 ? (
            <StateComp
              type='no-content'
              onAction={() => console.log('Create course')}
              message='Začněte vytvořením svého prvního kurzu'
            />
          ) : coursesError ? (
            <StateComp
              type='error'
              onAction={() => refetchCourses()}
              message='Nepodařilo se načíst kurzy'
            />
          ) : (
            filteredCourses.length === 0 && (
              <StateComp
                type='empty-search'
                onAction={() => setSearchQuery('')}
              />
            )
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardDesign1
