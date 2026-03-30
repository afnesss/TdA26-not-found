import { adminLogout, organizationLogout } from '@/api/queries/organizationQueries'
import { useAuth } from '@/auth/useAuth'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import { Button } from '@/components/ui/button'
import {
  buildOrgCoursesPath,
  buildOrgDashboardPath,
  buildOrgLoginPath,
} from '@/lib/routes'
import { buildShopPath, resolveShopOrgSlug } from '@/pages/shop/shopUtils'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import logo from '../../assets/white_logo.svg'

export default function Header() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const queryClient = useQueryClient()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const isAdminArea = pathname.startsWith('/admin')
  const isOrganizationArea = Boolean(orgSlug) && !isAdminArea
  const isOrganizationRequestActive = pathname.startsWith('/organization-request')
  const isAdminLoginActive = pathname === '/admin/login'
  const isAdminRequestsActive = pathname.startsWith('/admin/requests')
  const isAdminOrganizationsActive = pathname.startsWith('/admin/organizations')
  const isShopActive = pathname.startsWith('/shop')
  const isOrgCoursesActive =
    isOrganizationArea && pathname.startsWith(`/${orgSlug}/courses`)
  const isOrgDashboardActive =
    isOrganizationArea && pathname.startsWith(`/${orgSlug}/dashboard`)
  const isOrgLoginActive =
    isOrganizationArea && pathname === buildOrgLoginPath(orgSlug)
  const shopOrgSlug = resolveShopOrgSlug(
    isOrganizationArea ? orgSlug : new URLSearchParams(search).get('org'),
  )
  const { isAuth: isAdminAuth } = useAuth()
  const {
    isAuth: isOrgAuth,
    isAdmin: isOrgAdmin,
    isStaff: isOrgStaff,
    user: orgUser,
  } = useOrganizationAuth(orgSlug)
  const selectedSecondaryButtonClass =
    'bg-secondary text-accent-blue hover:bg-secondary active:bg-secondary'

  const handleLogout = async () => {
    try {
      if (isOrganizationArea && orgSlug && isOrgAuth) {
        await organizationLogout(orgSlug)
        queryClient.setQueryData(['org-auth', orgSlug], null)
        toast.success('Odhlášení úspěšné')
        navigate(buildOrgLoginPath(orgSlug))
        return
      }

      if (isAdminAuth) {
        await adminLogout()
        queryClient.setQueryData(['auth', 'me'], null)
        toast.success('Odhlášení úspěšné')
        navigate('/admin/login')
      }
    } catch {
      toast.error('Chyba při odhlašování')
    }
  }

  return (
    <header
      className='fixed top-0 left-0 right-0 z-50 flex h-15 w-full bg-primary sm:h-18 md:h-22'
      role='banner'
    >
      <div className='flex w-1/2 items-center px-4 sm:px-8 md:px-12 lg:px-20'>
        <img
          src={logo}
          alt='Logo Think Different Academy'
          className='h-14 w-auto cursor-pointer py-3 transition-all duration-200 hover:scale-102 sm:h-17 md:h-18'
          onClick={() =>
            navigate(
              isOrganizationArea && orgSlug ? `/${orgSlug}` : isAdminArea ? '/admin/requests' : '/',
            )
          }
          role='button'
          aria-label='Přejít na úvodní stránku'
        />
      </div>
      <div className='flex w-1/2 items-center justify-end gap-3 px-4 sm:px-8 md:px-12 lg:px-20'>
        {isAdminArea ? (
          <>
            <Button
              variant='tab'
              className={cn(isShopActive && 'text-secondary')}
              aria-current={isShopActive ? 'page' : undefined}
              onClick={() => navigate(buildShopPath('/shop', shopOrgSlug))}
            >
              Shop
            </Button>
            {isAdminAuth && (
              <>
                <Button
                  variant='tab'
                  className={cn(
                    isAdminRequestsActive && 'text-secondary',
                  )}
                  aria-current={isAdminRequestsActive ? 'page' : undefined}
                  onClick={() => navigate('/admin/requests')}
                >
                  Žádosti
                </Button>
                <Button
                  variant='tab'
                  className={cn(
                    isAdminOrganizationsActive && 'text-secondary',
                  )}
                  aria-current={isAdminOrganizationsActive ? 'page' : undefined}
                  onClick={() => navigate('/admin/organizations')}
                >
                  Organizace
                </Button>
              </>
            )}
            <Button
              variant='secondary'
              className={cn(!isAdminAuth && isAdminLoginActive && selectedSecondaryButtonClass)}
              onClick={() => (isAdminAuth ? void handleLogout() : navigate('/admin/login'))}
            >
              {isAdminAuth ? 'Odhlásit se' : 'Přihlásit se'}
            </Button>
          </>
        ) : isOrganizationArea && orgSlug ? (
          <>
            <Button
              variant='tab'
              className={cn(isShopActive && 'text-secondary')}
              aria-current={isShopActive ? 'page' : undefined}
              onClick={() => navigate(buildShopPath('/shop', shopOrgSlug))}
            >
              Shop
            </Button>
            <Button
              variant='tab'
              className={cn(isOrgCoursesActive && 'text-secondary')}
              aria-current={isOrgCoursesActive ? 'page' : undefined}
              onClick={() => navigate(buildOrgCoursesPath(orgSlug))}
            >
              {orgUser?.role === 'student' && (
                <span className='mr-2 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-secondary'>
                  <span>LVL {orgUser.level ?? 1}</span>
                  <span>•</span>
                  <span>{orgUser.xp ?? 0} XP</span>
                </span>
              )}
              Kurzy
            </Button>
            {isOrgStaff && (
              <Button
                variant='tab'
                className={cn(isOrgDashboardActive && 'text-secondary')}
                aria-current={isOrgDashboardActive ? 'page' : undefined}
                onClick={() => navigate(buildOrgDashboardPath(orgSlug))}
              >
                Dashboard
              </Button>
            )}
            <Button
              variant='secondary'
              className={cn(!isOrgAuth && isOrgLoginActive && selectedSecondaryButtonClass)}
              aria-current={isOrgLoginActive ? 'page' : undefined}
              onClick={() =>
                isOrgAuth
                  ? void handleLogout()
                  : navigate(buildOrgLoginPath(orgSlug))
              }
            >
              {isOrgAuth ? 'Odhlásit se' : 'Přihlášení'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant='tab'
              className={cn(isShopActive && 'text-secondary')}
              aria-current={isShopActive ? 'page' : undefined}
              onClick={() => navigate(buildShopPath('/shop', shopOrgSlug))}
            >
              Shop
            </Button>
            <Button
              variant='secondary'
              className={cn(
                isOrganizationRequestActive && selectedSecondaryButtonClass,
              )}
              onClick={() => navigate('/organization-request/new')}
            >
              Založit si organizaci
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
