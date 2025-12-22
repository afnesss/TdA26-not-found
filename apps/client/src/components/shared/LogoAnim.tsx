import logo from '../../assets/blue_logo.png'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type LogoAnimType ={
  className?: string,
  sizeBlur1?: string,
  sizeBlur2?: string
}

const LogoAnim = ({className, sizeBlur1, sizeBlur2}:LogoAnimType)=> {
  return (
    <>
        <div className='absolute inset-0 flex items-center justify-center'>

          <motion.div 
            className={cn('absolute w-72 h-72 bg-secondary rounded-full blur-3xl', sizeBlur1)}
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className={cn('absolute w-80 h-80 bg-accent-teal-light rounded-full blur-3xl', sizeBlur2)}
            animate={{
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

        </div>
      <div className="relative z-10">
        <motion.img 
          src={logo} 
          className={cn('h-32 w-32 lg:h-40 lg:w-40 object-contain', className)} 
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(69, 123, 255, 0.3)) drop-shadow(0 10px 20px rgba(145, 245, 173, 0.2))'
          }}
        />
        
        
      </div>
      </>
  )
}

export default LogoAnim
