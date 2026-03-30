import React from 'react'
import { buildOrgCoursesPath, buildOrgInfoPath } from '@/lib/routes'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const isOrganizationArea = Boolean(orgSlug) && !pathname.startsWith('/admin')

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
          <span className='mr-2'>© 2026 Think Different Academy</span>

          <div className='flex flex-wrap gap-2 sm:gap-4 items-center'>
            <span
              className='cursor-pointer hover:text-secondary'
              onClick={() => navigate(isOrganizationArea && orgSlug ? buildOrgCoursesPath(orgSlug) : '/')}
            >
              Kurzy
            </span>
            {isOrganizationArea && orgSlug && (
              <span
                className='cursor-pointer hover:text-secondary'
                onClick={() => navigate(buildOrgInfoPath(orgSlug))}
              >
                Info
              </span>
            )}
            <span
              className='cursor-pointer hover:text-secondary'
              onClick={() => navigate('/shop')}
            >
              Shop
            </span>
            <span
              className='cursor-pointer hover:text-secondary'
              onClick={() => navigate('/terms-of-use')}
            >
              Podmínky použití
            </span>
            <span
              onClick={() => navigate('/privacy-policy')}
              className='cursor-pointer hover:text-secondary'
            >
              Ochrana osobních údajů
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
