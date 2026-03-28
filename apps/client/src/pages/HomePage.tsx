import { useCoursesSSE } from '@/api/useCourseSSE'
import ActivitiesIcon from '@/assets/activities-blue.svg?react'
import LogoAnim from '@/components/shared/LogoAnim'
import TitleText from '@/components/shared/TitleText'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import HintPageText from '../components/shared/HintPageText'
import { useMediaQuery } from 'usehooks-ts'
import { Label } from '@/components/ui/label'
import UnderlinedText from '@/components/shared/UnderlinedText'

const HomePage = () => {
  const navigate = useNavigate()
  const { isConnected } = useCoursesSSE()
  const isMd = useMediaQuery('(min-width: 768px)')
  return (
    <div className='grid grid-cols-1 md:grid-cols-[68%_32%] items-center justify-center max-w-9xl mx-auto md:px-10 lg:px-16 gap-x-10 lg:gap-x-16'>
      <div className='flex flex-col max-sm:justify-center gap-7 sm:gap-10 md:gap-10 w-full md:px-7 '>
        <HintPageText text='Učení může být zábava' icon={ActivitiesIcon} />

        <TitleText
          className='max-sm:text-4xl text-5xl sm:text-5xl md:text-5xl lg:text-6xl'
          underlinedText='Kreativní'
          addtext2=' myšlení s'
          highlightedText='Think Different Academy'
          underlineHeight={isMd ? '19' : '16'}
          underlineStrokeWidth='4'
          underlineOffset={isMd ? '-bottom-2.5' : '-bottom-1.5'}
        />

        <Label variant={'description'}>
          Nezisková organizace pro vzdělávání studentů i veřejnosti. Přinášíme{' '}
          {
            <UnderlinedText
              strokeWidth={isMd ? undefined : '4'}
              height={isMd ? undefined : '9'}
              offset={isMd ? undefined : '-bottom-0.5'}
              className='font-bold'
            >
              moderní
            </UnderlinedText>
          }{' '}
          a{' '}
          {
            <UnderlinedText
              strokeWidth={isMd ? undefined : '4'}
              height={isMd ? undefined : '9'}
              offset={isMd ? undefined : '-bottom-0.5'}
              className='font-bold'
            >
              interaktivní
            </UnderlinedText>
          }{' '}
          výuku - bez úmorného pročítání textů.
        </Label>

        <div className='flex flex-row gap-5'>
          <Button
            variant='primary'
            size='primary'
            className='group text-xl sm:text-xl md:text-xl'
            onClick={() => {
              navigate('/courses')
            }}
          >
            Procházet kurzy
          </Button>
        </div>
      </div>

      <div className='relative items-center justify-center h-full hidden md:flex'>
        <LogoAnim className='h-56 w-56 lg:h-72 lg:w-72' />
      </div>
    </div>
  )
}

export default HomePage
