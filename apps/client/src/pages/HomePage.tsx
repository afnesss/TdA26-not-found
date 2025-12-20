
import HomeBoxDetail from '../components/shared/HomeBoxDetail'
import { Brain, Lightbulb, Zap, Trophy } from 'lucide-react'
import {Button} from '../components/ui/button';
import logo from "../assets/blue_logo.png";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HintPageText from '../components/shared/HintPageText';
import LogoAnim from '@/components/shared/LogoAnim';


const HomePage = () => {
  // const {isLoginOpen} = useModalStore();

  const navigate = useNavigate();

  return (
    
    <div className='grid grid-cols-1 md:grid-cols-3 items-center h-full justify-center max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
      
      <div className='flex flex-col max-sm:justify-center md:col-span-2 gap-10 w-full'>
      <HintPageText text="Učení může být zábava" icon={Trophy}/>
      <h1 className=' max-sm:text-2xl text-3xl lg:text-4xl text-foreground font-bold text-left'>Rozvíjejte své 
        {' '}
        <span className="relative inline-block my-2">
          kritické a kreativní
          <svg 
            className="absolute -bottom-2 left-0 w-full overflow-visible" 
            height="12" 
            viewBox="0 0 400 12"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,10 Q50,3 110,9 Q150,14 200,4 Q250,2 300,11 Q350,15 400,6"
              stroke="#91F5AD" 
              strokeWidth="5" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span> {' '}
        myšlení s <br/>
        <span className='text-primary'>Think Different Academy</span>
      </h1>

      <div className='text-md md:text-lg text-foreground text-left max-w-full md:max-w-xl lg:max-w-2xl'>Nezisková organizace zaměřená na rozvoj kritického a kreativního myšlení. Moderní, interaktivní přístup bez úmorného pročítání textů.</div>

      <div className='flex flex-row gap-5'>
        
        <Button variant='primary' size="primary" onClick={() => {navigate('/courses')}}>Procházet Kurzy</Button>      

      </div>

      <div className='grid grid-cols-3 max-w-2xl gap-3 sm:gap-5'>
        <HomeBoxDetail bg='accent-teal-light' icon={Brain} text='Chytré řešení'/>
        <HomeBoxDetail bg='accent-teal' icon={Lightbulb} text='Interaktivní přístup'/>
        <HomeBoxDetail bg='accent-teal-dark' icon={Zap} text='Jednoduše a rychle'/>
      </div>


    </div>

      <div className='col-span-1 relative  items-center justify-center h-full hidden md:flex'>
        <LogoAnim className='h-50 w-50 lg:h-64 lg:w-64'/>
      </div>
    </div>
  )
}

export default HomePage