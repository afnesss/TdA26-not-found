import apiFetch from '../client'

export type AdminLoginResponse = {
  token: string
  actorType: 'platform_admin'
  username: string
}

export type AuthUser = {
  actorType?: 'platform_admin'
  username?: string
} | null

export const userLogin = async (body: {
  username: string
  password: string
}): Promise<AdminLoginResponse> => {
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
