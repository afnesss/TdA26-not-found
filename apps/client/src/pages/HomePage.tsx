import { useCoursesSSE } from '@/api/useCourseSSE'
import ActivitiesIcon from '@/assets/activities-blue.svg?react'
import LogoAnim from '@/components/shared/LogoAnim'
import TitleText from '@/components/shared/TitleText'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import HintPageText from '../components/shared/HintPageText'

const HomePage = () => {
  const navigate = useNavigate()
  const { isConnected } = useCoursesSSE()

  return (
    <div className='grid grid-cols-1 md:grid-cols-[70%_30%] items-center justify-center max-w-7xl mx-auto md:px-6 lg:px-12'>
      <div className='flex flex-col max-sm:justify-center gap-7 md:gap-10 w-full'>
        <HintPageText text='Učení může být zábava' icon={ActivitiesIcon} />

        <TitleText
          className='max-sm:text-2xl text-4xl lg:text-5xl'
          addtext1='Rozvíjejte své '
          underlinedText='kritické a kreativní'
          addtext2=' myšlení s'
          highlightedText='Think Different Academy'
          underlineHeight='18'
          underlineStrokeWidth='4'
          underlineOffset='-bottom-2.5'
        />

        <Label variant={'description'}>
          Think Different Academy je nezisková organizace zaměřená na rozvoj
          kritického a kreativního myšlení studentů i široké veřejnosti. Naše
          platforma propojuje kurzy a moderní, interaktivní učení pro studenty i
          lektory — bez úmorného pročítání textů a s důrazem na praxi a dopad.
        </Label>

        <div className='flex flex-row gap-5'>
          <Button
            variant='primary'
            size='primary'
            onClick={() => {
              navigate('/courses')
            }}
          >
            Procházet kurzy
          </Button>
        </div>
      </div>

      <div className='relative items-center justify-center h-full hidden md:flex'>
        <LogoAnim className='h-50 w-50 lg:h-64 lg:w-64' />
      </div>
    </div>
  )
}

export default HomePage
