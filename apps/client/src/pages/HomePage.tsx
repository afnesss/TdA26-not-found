import { useCoursesSSE } from '@/api/useCourseSSE'
import LandingHero from '@/components/shared/LandingHero'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  useCoursesSSE()

  return (
    <LandingHero
      variant='home'
      highlightedText='Think Different Academy'
      onPrimaryCta={() => navigate('/organization-request/new')}
      showHelperText
    />
  )
}

export default HomePage
