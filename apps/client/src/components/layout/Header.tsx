import auth from '@/auth/fakeAuth'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { ChevronDown, LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useMediaQuery } from 'usehooks-ts'
import logo from '../../assets/white_logo.png'
import { Button } from '../ui/button'

export default function Header() {
  const navigate = useNavigate()
  const isMd = useMediaQuery('(min-width: 768px)')
  const isDashboard = location.pathname.includes('/dashboard')

  return (
    <>
      <div className='w-full h-15 sm:h-18 md:h-22 flex'>
        <div className='w-1/2 bg-accent-blue px-4 sm:px-8 md:px-12 lg:px-20 flex items-center'>
          <img
            src={logo}
            className='h-14 sm:h-17 md:h-18 w-auto py-3 cursor-pointer hover:scale-102 transition-all duration-200'
            onClick={() => navigate('/')}
          />
        </div>
        <div className='w-1/2 flex px-4 sm:px-8 md:px-12 lg:px-20 items-center gap-4 md:gap-10 justify-end-safe bg-primary'>
          {isMd ? (
            <div className='flex flex-col sm:flex-row flex-wrap items-center gap-2 md:gap-10'>
              <Button variant={'tab'} onClick={() => navigate('/courses')}>
                Kurzy
              </Button>
              {auth.isAutenticated() && (
                <Button variant='tab' onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              )}
            </div>
          ) : // {auth.isAutenticated()
          auth.isAutenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='tab'
                  className='gap-1 text-xs hover:bg-primary/10 transition-colors'
                >
                  {isDashboard ? <span>Dashboard</span> : <span>Kurzy</span>}
                  <ChevronDown size={16} className='opacity-60' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                sideOffset={5}
                align='end'
                className='w-25 bg-background rounded-xl shadow-lg border border-gray-200 p-1.5 sm:p-2 z-100'
              >
                <div className='space-y-0.5 sm:space-y-1'>
                  <DropdownMenuItem
                    className={cn(
                      'px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all',
                      'hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium',
                      !isDashboard && 'bg-primary/5 text-primary',
                    )}
                    onClick={() => navigate('/courses')}
                  >
                    <span className='flex-1'>Kurzy</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className={cn(
                      'px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all',
                      'hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium',
                      isDashboard && 'bg-primary/5 text-primary',
                    )}
                    onClick={() => navigate('/dashboard')}
                  >
                    <span className='flex-1'>Dashboard</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant={'tab'} onClick={() => navigate('/courses')}>
              Kurzy
            </Button>
          )}
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
