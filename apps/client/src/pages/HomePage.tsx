import { useCoursesSSE } from '@/api/useCourseSSE'
import LandingHero from '@/components/shared/LandingHero'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  useCoursesSSE()

  return (
    <LandingHero
      highlightedText='Think Different Academy'
      primaryCtaLabel='Založit si organizaci'
      onPrimaryCta={() => navigate('/organization-request/new')}
      showHelperText
    />
  )
}

export default HomePage
