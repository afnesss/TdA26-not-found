import type {
  AdminAuthMe,
  Organization,
  OrganizationAuthMe,
  OrganizationPublicInfo,
  OrganizationRequest,
  OrganizationRequestCreate,
  OrganizationRequestPublicStatusResponse,
  OrganizationRequestSubmission,
} from '@/lib/schemas'
import { buildOrgApiPrefix } from '@/lib/routes'
import apiFetch from '../client'

export const submitOrganizationRequest = async (
  body: OrganizationRequestCreate,
): Promise<OrganizationRequestSubmission> =>
  apiFetch('/organization-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const getOrganizationRequestStatus = async (
  requestId: string,
): Promise<OrganizationRequestPublicStatusResponse> =>
  apiFetch(`/organization-requests/${requestId}`)

export const getOrganizationDirectory = async (): Promise<
  Array<Pick<Organization, 'uuid' | 'name' | 'slug' | 'city' | 'country' | 'region' | 'type'>>
> => apiFetch('/organization-requests')

export const adminLogin = async (body: {
  username: string
  password: string
}) =>
  apiFetch('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const adminLogout = async () =>
  apiFetch('/admin/auth/logout', {
    method: 'POST',
  })

export const adminMe = async (): Promise<AdminAuthMe> =>
  apiFetch('/admin/auth/me')

export const getAdminOrganizationRequests = async (): Promise<
  OrganizationRequest[]
> => apiFetch('/admin/organization-requests')

export const getAdminOrganizationRequest = async (
  requestId: string,
): Promise<OrganizationRequest> =>
  apiFetch(`/admin/organization-requests/${requestId}`)

export const approveAdminOrganizationRequest = async (
  requestId: string,
  adminNote?: string,
) =>
  apiFetch(`/admin/organization-requests/${requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ adminNote }),
  })

export const rejectAdminOrganizationRequest = async (
  requestId: string,
  adminNote: string,
) =>
  apiFetch(`/admin/organization-requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ adminNote }),
  })

export const getAdminOrganizations = async (): Promise<Organization[]> =>
  apiFetch('/admin/organizations')

export const updateAdminOrganization = async (
  orgId: string,
  body: Partial<Organization>,
): Promise<Organization> =>
  apiFetch(`/admin/organizations/${orgId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const getOrganizationPublicInfo = async (
  orgSlug: string,
): Promise<OrganizationPublicInfo> => apiFetch(`${buildOrgApiPrefix(orgSlug)}`)

export const getOrganizationAccessStatus = async (
  orgSlug: string,
): Promise<OrganizationPublicInfo> =>
  apiFetch(`${buildOrgApiPrefix(orgSlug)}/status`)

export const organizationLogin = async (
  orgSlug: string,
  body: {
    mode?: 'admin' | 'lecturer' | 'student'
    username?: string
    password: string
  },
): Promise<OrganizationAuthMe> =>
  apiFetch(`${buildOrgApiPrefix(orgSlug)}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const organizationLogout = async (orgSlug: string) =>
  apiFetch(`${buildOrgApiPrefix(orgSlug)}/auth/logout`, {
    method: 'POST',
  })

export const organizationMe = async (
  orgSlug: string,
): Promise<OrganizationAuthMe> =>
  apiFetch(`${buildOrgApiPrefix(orgSlug)}/auth/me`)

export const organizationChangePassword = async (
  orgSlug: string,
  body: { currentPassword: string; newPassword: string },
): Promise<OrganizationAuthMe> =>
  apiFetch(`${buildOrgApiPrefix(orgSlug)}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
