import type { UseFormSetError, FieldValues } from 'react-hook-form'

const auth = {
  login(
    login: string,
    password: string,
    setError: UseFormSetError<FieldValues>,
  ) {
    if (login !== 'lecturer' || password !== 'TdA26!') {
      setError('password', {
        type: 'manual',
        message: 'Nesprávné přihlašovací údaje',
      })
      return false
    }

    localStorage.setItem('isAuth', 'true')
    return true
  },

  logout() {
    localStorage.removeItem('isAuth')
  },

  isAutenticated() {
    return localStorage.getItem('isAuth') === 'true'
  },
}

export default auth
