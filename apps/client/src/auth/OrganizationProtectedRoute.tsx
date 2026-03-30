import { buildOrgDashboardPath, buildOrgLoginPath, buildOrgPasswordPath } from '@/lib/routes'
import { isOrganizationInactiveError } from '@/lib/organizationAccess'
import type { ApiError } from '@/lib/types'
import React from 'react'
import { Navigate, useParams } from 'react-router'
import { useOrganizationAuth } from './useOrganizationAuth'

const OrganizationProtectedRoute = ({
  children,
  allowPasswordChangeOnly = false,
}: {
  children: React.ReactNode
  allowPasswordChangeOnly?: boolean
}) => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const { isAuth, isAdmin, isStaff, isLoading, me, error } = useOrganizationAuth(orgSlug)
  const apiError = error as ApiError | null
  const errorStatus = apiError?.status

  if (isLoading) return <></>
  if (apiError && isOrganizationInactiveError(apiError)) {
    return <></>
  }
  if (errorStatus === 404) {
    return <></>
  }
  if (!isAuth) {
    return <Navigate to={buildOrgLoginPath(orgSlug)} replace />
  }

  if (allowPasswordChangeOnly && !isAdmin) {
    return <Navigate to={buildOrgDashboardPath(orgSlug)} replace />
  }

  if (!allowPasswordChangeOnly && !isStaff) {
    return <Navigate to={buildOrgLoginPath(orgSlug)} replace />
  }

  if (me?.mustChangePassword && !allowPasswordChangeOnly) {
    return <Navigate to={buildOrgPasswordPath(orgSlug)} replace />
  }

  return <>{children}</>
}

export default OrganizationProtectedRoute
