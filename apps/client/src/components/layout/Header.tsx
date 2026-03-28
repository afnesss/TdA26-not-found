import { userLogout } from '@/api/queries/authQueries'
import { useAuth } from '@/auth/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import DropdownMenuComponent from '@/components/shared/DropdownMenuComponent'
import { cn } from '@/lib/utils'
import { ChevronDown, LogIn, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'
import logo from '../../assets/white_logo.svg'
import { Button } from '../ui/button'

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const isMd = useMediaQuery('(min-width: 768px)')
  const isDashboard = pathname.includes('/dashboard')
  const isCourses = pathname.includes('/courses')
  const isLogin = pathname.includes('/login')
  const { isAuth, user } = useAuth()

  const isLecturer = user?.role === 'lecturer'
  const isStudent = user?.role === 'student'

  return (
    <>
      <header
        className='fixed top-0 left-0 right-0 z-50 w-full h-15 sm:h-18 md:h-22 flex bg-primary'
        role='banner'
      >
        <div className='w-1/2 px-4 sm:px-8 md:px-12 lg:px-20 flex items-center'>
          <img
            src={logo}
            alt='Logo Think Different Academy'
            className='h-14 sm:h-17 md:h-18 w-auto py-3 cursor-pointer hover:scale-102 transition-all duration-200'
            onClick={() => navigate('/')}
            role='button'
            aria-label='Přejít na úvodní stránku'
          />
        </div>
        <div className='w-1/2 flex px-4 sm:px-8 md:px-12 lg:px-20 items-center gap-4 md:gap-10 justify-end-safe '>
          {isMd ? (
            <nav
              className='flex flex-col sm:flex-row flex-wrap items-center gap-2 md:gap-10'
              aria-label='Hlavní navigace'
            >
              <Button
                variant={'tab'}
                className={cn(isCourses && 'text-secondary ...')}
                onClick={() => navigate('/courses')}
                aria-label='Přejít na kurzy'
                aria-current={isCourses ? 'page' : undefined}
              >
                Kurzy
              </Button>
              {isLecturer && (
                <Button
                  variant='tab'
                  className={cn(isDashboard && 'text-secondary ...')}
                  onClick={() => navigate('/dashboard')}
                  aria-label='Přejít na Dashboard'
                  aria-current={isDashboard ? 'page' : undefined}
                >
                  Dashboard
                </Button>
              )}
            </nav>
          ) : isLecturer ? (
            <DropdownMenuComponent
              trigger={
                <Button
                  variant='tab'
                  className='gap-1 text-xs hover:bg-primary/10 transition-colors'
                >
                  {isDashboard ? <span>Dashboard</span> : <span>Kurzy</span>}
                  <ChevronDown size={16} className='opacity-60' />
                </Button>
              }
              items={[
                {
                  label: 'Kurzy',
                  value: 'courses',
                  onClick: () => navigate('/courses'),
                },
                {
                  label: 'Dashboard',
                  value: 'dashboard',
                  onClick: () => navigate('/dashboard'),
                },
              ]}
              selectedValue={isDashboard ? 'dashboard' : 'courses'}
              align='end'
              width='w-25'
            />
          ) : (
            <Button
              variant={'tab'}
              onClick={() => navigate('/courses')}
              aria-label='Přejít na kurzy'
            >
              Kurzy
            </Button>
          )}

          {isStudent && (
            <div className='flex items-center gap-1 rounded-md border border-white/35 bg-white/12 px-2 py-1 text-white/95'>
              <span className='text-xs font-medium'>Lvl {user.level}</span>
              <span className='text-[10px] opacity-75'>|</span>
              <span className='text-xs font-medium'>XP {user.xp}</span>
            </div>
          )}

          <Button
            variant={'secondary'}
            aria-current={isLogin ? 'page' : undefined}
            className={cn(
              `text-sm md:text-base px-2 py-2 md:px-4 ${isAuth ? 'text-destructive' : 'text-primary'}`,
              isLogin && !isAuth && 'bg-secondary text-primary',
            )}
            onClick={async () => {
              if (isAuth) {
                try {
                  await userLogout()
                  queryClient.setQueryData(['auth', 'me'], null)
                  toast.success('Odhlášení úspěšné')
                } catch (_error) {
                  toast.error('Chyba při odhlašování')
                  return
                }
                if (isDashboard) {
                  navigate('/login')
                }
                return
              }
              navigate('/login')
            }}
            aria-label={isAuth ? 'Odhlásit se' : 'Přihlásit se'}
          >
            <span className='hidden sm:block'>
              {isAuth ? 'Odhlásit se' : 'Přihlásit se'}
            </span>
            {isAuth ? (
              <LogOut
                size={20}
                className='text-destructive block sm:hidden '
                aria-hidden='true'
              />
            ) : (
              <LogIn
                size={20}
                className='block sm:hidden '
                aria-hidden='true'
              />
            )}
          </Button>
        </div>
      </header>
    </>
  )
}
