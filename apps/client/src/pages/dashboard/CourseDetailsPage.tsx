import { getCourses } from '@/api/queries/courseQueries'
import StateComp from '@/components/shared/StateComp'
import TabButton from '@/components/shared/TabButton'
import type { CourseSummary, Material } from '@/lib/schemas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, BookOpenText, FileText, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DetailsContentSkeleton } from '../../components/shared/loadingskeleton/DetailsSkeleton'
import CourseDetailsForm from './components/CourseDetailsForm'
import FeedTab from './components/FeedTab'
import MaterialsTab from './components/MaterialsTab'
import QuizzesTab from './components/QuizzesTab'
import fileImg from '@/assets/files-blue.svg'
import fileImgAct from '@/assets/files-white.svg'
import quizImg from '@/assets/t-play-blue.svg'
import quizImgAct from '@/assets/t-play-white.svg'
import feedImg from '@/assets/audiocall-blue.svg'
import feedImgAct from '@/assets/audiocall-white.svg'

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
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
            icon={BookOpenText}
          />
          <TabButton
            isActive={activeTab === 'materials'}
            onClick={() => handleTabChange('materials')}
            title='Materiály'
            icon={fileImg}
            activeIcon={fileImgAct}
          />
          <TabButton
            isActive={activeTab === 'quizzes'}
            onClick={() => handleTabChange('quizzes')}
            title='Kvízy'
            icon={quizImg}
            activeIcon={quizImgAct}
            imgClassName='w-6 h-6'
          />
          <TabButton
            isActive={activeTab === 'feed'}
            onClick={() => handleTabChange('feed')}
            title='Informační kanál'
            icon={feedImg}
            activeIcon={feedImgAct}
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

      {activeTab === 'materials' && (
        <MaterialsTab courseId={courseId!} activeTab={activeTab} />
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <FeedTab courseId={courseId!} activeTab={activeTab} />
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <QuizzesTab courseId={courseId!} activeTab={activeTab} />
      )}
    </div>
  )
}

export default CourseDetailPage
