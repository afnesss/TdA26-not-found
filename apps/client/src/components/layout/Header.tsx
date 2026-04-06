import {
  adminLogout,
  organizationLogout,
} from '@/api/queries/organizationQueries'
import { useAuth } from '@/auth/useAuth'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import DropdownMenuComponent from '@/components/shared/DropdownMenuComponent'
import { Button } from '@/components/ui/button'
import { getStoredUiLocale, setUiLocale } from '@/lib/i18n'
import {
  buildOrgCoursesPath,
  buildOrgDashboardPath,
  buildOrgLoginPath,
} from '@/lib/routes'
import type { Locale } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Languages, LogIn, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'
import { buildShopPath, resolveShopOrgSlug } from '@/pages/shop/shopUtils'
import logo from '../../assets/white_logo.svg'

type NavigationItem = {
  label: string
  value: string
  isActive: boolean
  onClick: () => void
}

type SecondaryAction = {
  label: string
  icon: typeof LogIn
  isActive: boolean
  isDestructive?: boolean
  onClick: () => void
}

const localeOptions: Locale[] = ['en', 'cs']

export default function Header() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const queryClient = useQueryClient()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const isMd = useMediaQuery('(min-width: 768px)')
  const { t, i18n } = useTranslation('header')
  const [uiLocale, setCurrentUiLocale] = useState<Locale>(getStoredUiLocale())

  // useEffect(() => {
  //   const nextLocale = i18n.resolvedLanguage
  //   if (nextLocale === 'en' || nextLocale === 'cs') {
  //     setCurrentUiLocale(nextLocale)
  //   }
  // }, [i18n.resolvedLanguage])

  const isAdminArea = pathname.startsWith('/admin')
  const isOrganizationArea = Boolean(orgSlug) && !isAdminArea
  const isOrganizationRequestActive = pathname.startsWith(
    '/organization-request',
  )
  const isAdminLoginActive = pathname === '/admin/login'
  const isAdminRequestsActive = pathname.startsWith('/admin/requests')
  const isAdminOrganizationsActive = pathname.startsWith('/admin/organizations')
  const isShopActive = pathname.startsWith('/shop')
  const isLegalPage =
    pathname === '/terms-of-use' || pathname === '/privacy-policy'
  const isOrgCoursesActive =
    isOrganizationArea && pathname.startsWith(`/${orgSlug}/courses`)
  const isOrgDashboardActive =
    isOrganizationArea && pathname.startsWith(`/${orgSlug}/dashboard`)
  const isOrgLoginActive =
    isOrganizationArea && pathname === buildOrgLoginPath(orgSlug)

  const shopOrgSlug = resolveShopOrgSlug(
    isOrganizationArea ? orgSlug : new URLSearchParams(search).get('org'),
  )
  const effectiveOrgSlug = isOrganizationArea ? orgSlug : shopOrgSlug

  const { isAuth: isAdminAuth } = useAuth()
  const {
    isAuth: isOrgAuth,
    isStaff: isOrgStaff,
    user: orgUser,
  } = useOrganizationAuth(effectiveOrgSlug)
  const isPublicOrgContextPage = isShopActive || isLegalPage
  const hasOrgNavigation =
    Boolean(effectiveOrgSlug) &&
    !isAdminArea &&
    (isOrganizationArea || (isPublicOrgContextPage && isOrgAuth))

  const selectedSecondaryButtonClass =
    'bg-secondary text-accent-blue hover:bg-secondary active:bg-secondary'

  const handleLanguageChange = async (locale: Locale) => {
    if (locale === uiLocale) return
    await setUiLocale(locale)
    setCurrentUiLocale(locale)
  }

  const handleLogout = async () => {
    try {
      if (effectiveOrgSlug && isOrgAuth) {
        await organizationLogout(effectiveOrgSlug)
        queryClient.setQueryData(['org-auth', effectiveOrgSlug], null)
        toast.success('Odhlášení úspěšné')
        navigate(buildOrgLoginPath(effectiveOrgSlug))
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

  const navigationItems: NavigationItem[] = isAdminArea
    ? [
        {
          label: t('navigation.shop'),
          value: 'shop',
          isActive: isShopActive,
          onClick: () => navigate(buildShopPath('/shop', shopOrgSlug)),
        },
        ...(isAdminAuth
          ? [
              {
                label: t('navigation.requests'),
                value: 'requests',
                isActive: isAdminRequestsActive,
                onClick: () => navigate('/admin/requests'),
              },
              {
                label: t('navigation.organizations'),
                value: 'organizations',
                isActive: isAdminOrganizationsActive,
                onClick: () => navigate('/admin/organizations'),
              },
            ]
          : []),
      ]
    : hasOrgNavigation && effectiveOrgSlug
      ? [
          {
            label: t('navigation.shop'),
            value: 'shop',
            isActive: isShopActive,
            onClick: () => navigate(buildShopPath('/shop', shopOrgSlug)),
          },
          {
            label: t('navigation.courses'),
            value: 'courses',
            isActive: isOrgCoursesActive,
            onClick: () => navigate(buildOrgCoursesPath(effectiveOrgSlug)),
          },
          ...(isOrgStaff
            ? [
                {
                  label: t('navigation.dashboard'),
                  value: 'dashboard',
                  isActive: isOrgDashboardActive,
                  onClick: () =>
                    navigate(buildOrgDashboardPath(effectiveOrgSlug)),
                },
              ]
            : []),
        ]
      : [
          {
            label: t('navigation.shop'),
            value: 'shop',
            isActive: isShopActive,
            onClick: () => navigate(buildShopPath('/shop', shopOrgSlug)),
          },
        ]

  const activeNavigationItem =
    navigationItems.find((item) => item.isActive) ?? navigationItems[0]
  const isAuthAction = isAdminArea || hasOrgNavigation
  const shouldShowXpInfo = hasOrgNavigation && orgUser?.role === 'student'

  const secondaryAction: SecondaryAction = isAdminArea
    ? {
        label: isAdminAuth ? t('actions.signOut') : t('actions.signIn'),
        icon: isAdminAuth ? LogOut : LogIn,
        isActive: !isAdminAuth && isAdminLoginActive,
        isDestructive: isAdminAuth,
        onClick: () =>
          isAdminAuth ? void handleLogout() : navigate('/admin/login'),
      }
    : hasOrgNavigation && effectiveOrgSlug
      ? {
          label: isOrgAuth ? t('actions.signOut') : t('actions.signIn'),
          icon: isOrgAuth ? LogOut : LogIn,
          isActive: !isOrgAuth && isOrgLoginActive,
          isDestructive: isOrgAuth,
          onClick: () =>
            isOrgAuth
              ? void handleLogout()
              : navigate(buildOrgLoginPath(effectiveOrgSlug)),
        }
      : {
          label: t('actions.createOrganization'),
          icon: LogIn,
          isActive: isOrganizationRequestActive,
          onClick: () => navigate('/organization-request/new'),
        }

  const localeSwitcherFooter = (
    <div className='flex w-full overflow-hidden rounded-lg  bg-background'>
      {localeOptions.map((locale) => {
        const isActive = uiLocale === locale
        return (
          <button
            key={locale}
            type='button'
            onClick={() => void handleLanguageChange(locale)}
            className={cn(
              'flex-1 cursor-pointer px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-primary/15 hover:text-primary',
            )}
            aria-pressed={isActive}
          >
            {locale}
          </button>
        )
      })}
    </div>
  )

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
              hasOrgNavigation && effectiveOrgSlug
                ? `/${effectiveOrgSlug}`
                : '/',
            )
          }
          role='button'
          aria-label='Přejít na úvodní stránku'
        />
      </div>
      <div className='flex w-1/2 items-center justify-end gap-4 px-4 sm:px-8 md:gap-6 md:px-12 lg:px-20'>
        {shouldShowXpInfo && (
          <div className='inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-background/25 px-2 py-1 text-xs sm:text-base font-semibold text-background'>
            <span>LVL {orgUser.level ?? 1}</span>
            <span>•</span>
            <span>{orgUser.xp ?? 0} XP</span>
          </div>
        )}
        {isMd && (
          <DropdownMenuComponent
            trigger={
              <Button
                variant='tab'
                className='gap-1 text-xs transition-colors hover:bg-primary/10'
              >
                <Languages size={16} />
                {uiLocale.toUpperCase()}
                <ChevronDown size={16} className='opacity-60' />
              </Button>
            }
            items={localeOptions.map((locale) => ({
              label: locale.toUpperCase(),
              value: locale,
              onClick: () => void handleLanguageChange(locale),
            }))}
            selectedValue={uiLocale}
            align='end'
            width='w-24'
          />
        )}
        {isMd || navigationItems.length <= 1 ? (
          <>
            {navigationItems.map((item) => (
              <Button
                key={item.value}
                variant='tab'
                className={cn(item.isActive && 'text-secondary')}
                aria-current={item.isActive ? 'page' : undefined}
                onClick={item.onClick}
              >
                {item.label}
              </Button>
            ))}
          </>
        ) : (
          <DropdownMenuComponent
            trigger={
              <Button
                variant='tab'
                className='gap-1 text-xs transition-colors hover:bg-primary/10'
              >
                {activeNavigationItem?.label ?? t('navigation.menu')}
                <ChevronDown size={16} className='opacity-60' />
              </Button>
            }
            items={navigationItems.map((item) => ({
              label: item.label,
              value: item.value,
              onClick: item.onClick,
            }))}
            selectedValue={activeNavigationItem?.value}
            align='end'
            width='w-40'
            footer={<div className='w-full px-1'>{localeSwitcherFooter}</div>}
          />
        )}
        <Button
          variant='secondary'
          className={cn(
            secondaryAction.isActive && selectedSecondaryButtonClass,
            secondaryAction.isDestructive && 'text-destructive',
          )}
          aria-current={secondaryAction.isActive ? 'page' : undefined}
          onClick={secondaryAction.onClick}
        >
          <span
            className={cn(
              'text-xs md:text-base',
              isAuthAction && 'hidden md:inline',
            )}
          >
            {secondaryAction.label}
          </span>
          <secondaryAction.icon
            size={20}
            className={cn(
              isAuthAction ? 'block md:hidden' : 'hidden',
              secondaryAction.isDestructive && 'text-destructive',
            )}
          />
        </Button>
      </div>
    </header>
  )
}
