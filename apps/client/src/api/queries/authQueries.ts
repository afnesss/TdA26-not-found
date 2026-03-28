import apiFetch from '../client'

export type AuthUser = {
  id: string
  username: string
  role: 'lecturer' | 'student'
  xp: number
  level: number
}

export type AuthResponse = {
  user: AuthUser
}

export const userLogin = async (body: {
  username: string
  password: string
}) => {
  return await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const studentUpsertLogin = async (body: {
  username: string
  password: string
}) => {
  return await apiFetch<AuthResponse>('/auth/student/upsert-login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const userLogout = async () => {
  return await apiFetch('/auth/logout', {
    method: 'POST',
  })
}

export const userCheck = async () => {
  return await apiFetch<AuthUser>('/auth/me')
}
