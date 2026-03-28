import apiFetch from '../client'

export type AuthUser = {
  actorType?: 'platform_admin' | 'legacy_user'
  username?: string
  id?: string
  role?: string
  xp?: number
  level?: number
} | null

export const userLogin = async (body: {
  username: string
  password: string
}) => {
  return await apiFetch('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const userLogout = async () => {
  return await apiFetch('/admin/auth/logout', {
    method: 'POST',
  })
}

export const userCheck = async () => {
  return await apiFetch('/admin/auth/me')
}
