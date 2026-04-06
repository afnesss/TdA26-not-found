import { buildOrgCoursesPath, buildOrgInfoPath } from '@/lib/routes'
import { buildShopPath, resolveShopOrgSlug } from '@/pages/shop/shopUtils'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('footer')
  const { pathname, search } = useLocation()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const isOrganizationArea = Boolean(orgSlug) && !pathname.startsWith('/admin')
  const effectiveOrgSlug = resolveShopOrgSlug(
    isOrganizationArea ? orgSlug : new URLSearchParams(search).get('org'),
  )

  return (
    <footer className='w-full bg-foreground/90'>
      <div
        className='max-w-7xl mx-auto
               px-4 sm:px-8 lg:px-12 py-3
               text-gray-500 text-xs font-semibold
               flex flex-wrap gap-2
               sm:flex-nowrap sm:items-center sm:justify-between'
      >
        <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
          <span className='mr-2'>{t('copyright')}</span>

          <div className='flex flex-wrap gap-2 sm:gap-4 items-center'>
            {orgSlug && (
              <span
                className='cursor-pointer hover:text-secondary'
                onClick={() =>
                  navigate(
                    isOrganizationArea && orgSlug
                      ? buildOrgCoursesPath(orgSlug)
                      : '/',
                  )
                }
              >
                {t('navigation.courses')}
              </span>
            )}
            {isOrganizationArea && orgSlug && (
              <span
                className='cursor-pointer hover:text-secondary'
                onClick={() => navigate(buildOrgInfoPath(orgSlug))}
              >
                {t('navigation.info')}
              </span>
            )}
            <span
              className='cursor-pointer hover:text-secondary'
              onClick={() => navigate(buildShopPath('/shop', effectiveOrgSlug))}
            >
              {t('navigation.shop')}
            </span>
            <span
              className='cursor-pointer hover:text-secondary'
              onClick={() =>
                navigate(buildShopPath('/terms-of-use', effectiveOrgSlug))
              }
            >
              {t('navigation.terms')}
            </span>
            <span
              onClick={() =>
                navigate(buildShopPath('/privacy-policy', effectiveOrgSlug))
              }
              className='cursor-pointer hover:text-secondary'
            >
              {t('navigation.privacy')}
            </span>
          </div>
        </div>

        <a
          href='mailto:info@thinkdifferent.academy'
          className='hover:text-secondary transition-colors'
        >
          info@thinkdifferent.academy
        </a>
      </div>
    </footer>
  )
}

export default Footer
