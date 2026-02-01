import HomeBoxDetail from '../components/shared/HomeBoxDetail'
import { Zap, Trophy } from 'lucide-react'
import ThinkIcon from '@/assets/t-think-blue.svg?react'
import ActivitiesIcon from '@/assets/activities-blue.svg?react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import HintPageText from '../components/shared/HintPageText'
import LogoAnim from '@/components/shared/LogoAnim'
import { Label } from '@/components/ui/label'
import TitleText from '@/components/shared/TitleText'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 items-center justify-center max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
      <div className='flex flex-col max-sm:justify-center md:col-span-2 gap-7 md:gap-10 w-full'>
        <HintPageText text='Učení může být zábava' icon={Trophy} />

        <TitleText
          addtext1='Rozvíjejte své '
          underlinedText='kritické a kreativní'
          addtext2=' myšlení s'
          highlightedText='Think Different Academy'
        />

        <Label variant={'description'}>
          Nezisková organizace zaměřená na rozvoj kritického a kreativního
          myšlení. Moderní, interaktivní přístup bez úmorného pročítání textů.
        </Label>

        <div className='flex flex-row gap-5'>
          <Button
            variant='primary'
            size='primary'
            onClick={() => {
              navigate('/courses')
            }}
          >
            Procházet Kurzy
          </Button>
        </div>

        <div className='grid grid-cols-3 max-w-lg gap-4 sm:gap-5'>
          <HomeBoxDetail
            bg='accent-teal-light'
            icon={ThinkIcon}
            text='Chytré řešení'
          />
          <HomeBoxDetail
            bg='accent-teal'
            icon={ActivitiesIcon}
            text='Interaktivní přístup'
          />
          <HomeBoxDetail
            bg='accent-teal-dark'
            icon={Zap}
            iconClassName='fill-current [stroke-width:1]'
            text='Efektivně'
          />
        </div>
      </div>

      <div className='col-span-1 relative  items-center justify-center h-full hidden md:flex'>
        <LogoAnim className='h-50 w-50 lg:h-64 lg:w-64' />
      </div>
    </div>
  )
}

export default HomePage
