import logo from '../../assets/white_logo.png'
import { useNavigate, useLocation } from 'react-router'
import { Button } from '../ui/button'
import auth from '@/auth/fakeAuth'
import { cn } from '@/lib/utils'
import { LogOut, LogIn } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <>
      <div className='w-full h-15 sm:h-18 md:h-22 flex'>
        <div className='w-1/2 bg-accent-blue px-4 sm:px-8 md:px-12 lg:px-20 flex items-center'>
          <img
            src={logo}
            className='h-15 sm:h-17 md:h-18 w-auto py-3 cursor-pointer hover:scale-102 transition-all duration-200'
            onClick={() => navigate('/')}
          />
        </div>
        <div className='w-1/2 flex px-4 sm:px-8 md:px-12 lg:px-20 items-center gap-4 md:gap-10 justify-end-safe bg-primary'>
          <div className='flex flex-col sm:flex-row flex-wrap items-center gap-2 md:gap-10'>
            {auth.isAutenticated() && (
              <Button variant='tab' onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            )}
            <Button variant={'tab'} onClick={() => navigate('/courses')}>
              Kurzy
            </Button>
          </div>
          <Button
            variant={'secondary'}
            className={cn(
              `text-sm md:text-base px-2 py-2 md:px-4 ${auth.isAutenticated() ? 'text-destructive' : 'text-primary'}`,
            )}
            onClick={() => {
              if (auth.isAutenticated()) {
                auth.logout()
              }
              navigate('/login')
            }}
          >
            <span className='hidden sm:block'>
              {auth.isAutenticated() ? 'Odhlásit se' : 'Přihlásit se'}
            </span>
            {auth.isAutenticated() ? (
              <LogOut size={20} className='text-destructive block sm:hidden ' />
            ) : (
              <LogIn size={20} className='block sm:hidden ' />
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
