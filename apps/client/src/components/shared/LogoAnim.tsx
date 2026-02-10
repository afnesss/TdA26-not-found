import logo from '../../assets/blue_logo.svg'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type LogoAnimType = {
  className?: string
  sizeBlur1?: string
  sizeBlur2?: string
}

const LogoAnim = ({ className, sizeBlur1, sizeBlur2 }: LogoAnimType) => {
  return (
    <>
      <div className='absolute inset-0 flex items-center justify-center'>
        {/* <motion.div
          className={cn(
            'absolute w-80 h-80 bg-gray-400 rounded-full blur-3xl',
            sizeBlur1,
          )}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        /> */}
      </div>
      <div className='relative z-10'>
        <motion.img
          src={logo}
          className={cn('h-32 w-32 lg:h-36 lg:w-36 object-contain', className)}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </>
  )
}

export default LogoAnim
