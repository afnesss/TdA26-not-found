import {
  getOrganizationAccessStatus,
  organizationLogout,
} from '@/api/queries/organizationQueries'
import {
  ORG_INACTIVE_EVENT,
  isOrganizationInactiveError,
} from '@/lib/organizationAccess'
import type { ApiError } from '@/lib/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const ACCESS_POLL_INTERVAL = 15000

const OrganizationStatusWatcher = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const handledRef = useRef(false)

  const isLoginPath = location.pathname === `/${orgSlug}/login`
  const isPasswordPath = location.pathname === `/${orgSlug}/settings/password`
  const allowOnboarding = isLoginPath || isPasswordPath

  useEffect(() => {
    handledRef.current = false
  }, [orgSlug])

  const handleOrganizationUnavailable = useCallback(
    (showToast: boolean) => {
      if (!orgSlug || handledRef.current) return

      handledRef.current = true
      queryClient.setQueryData(['org-auth', orgSlug], null)
      void organizationLogout(orgSlug).catch(() => undefined)

      if (showToast) {
        toast.error('Organizace byla dočasně pozastavena. Přístup byl ukončen.', {
          id: `org-inactive-${orgSlug}`,
          duration: 5000,
        })
      }

      navigate('/', { replace: true })
    },
    [navigate, orgSlug, queryClient],
  )

  const { data, error } = useQuery({
    queryKey: ['organization-access-status', orgSlug],
    queryFn: () => getOrganizationAccessStatus(orgSlug!),
    enabled: Boolean(orgSlug),
    retry: false,
    refetchInterval: ACCESS_POLL_INTERVAL,
    refetchOnMount: 'always' as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (!data || !orgSlug) return

    const isAllowedStatus =
      data.status === 'active' || (allowOnboarding && data.status === 'onboarding')

    if (!isAllowedStatus) {
      handleOrganizationUnavailable(true)
    }
  }, [allowOnboarding, data, handleOrganizationUnavailable, orgSlug])

  useEffect(() => {
    if (!error) return

    const apiError = error as ApiError

    if (apiError.status === 404) {
      navigate('/', { replace: true })
      return
    }

    if (isOrganizationInactiveError(apiError)) {
      handleOrganizationUnavailable(true)
    }
  }, [error, handleOrganizationUnavailable, navigate])

  useEffect(() => {
    if (!orgSlug || typeof window === 'undefined') return

    const onInactive = (event: Event) => {
      const detail = (event as CustomEvent<{ orgSlug?: string }>).detail
      if (detail?.orgSlug === orgSlug) {
        handleOrganizationUnavailable(true)
      }
    }

    window.addEventListener(ORG_INACTIVE_EVENT, onInactive)
    return () => window.removeEventListener(ORG_INACTIVE_EVENT, onInactive)
  }, [handleOrganizationUnavailable, orgSlug])

  return <Outlet />
}

export default OrganizationStatusWatcher
