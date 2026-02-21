import apiFetch from '../client'

export const userLogin = async (body: {
  username: string
  password: string
}) => {
  return await apiFetch('/auth/login', {
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
  return await apiFetch('/auth/me')
}
