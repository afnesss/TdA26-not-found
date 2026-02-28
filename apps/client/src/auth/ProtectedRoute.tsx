import React from 'react'
import { Navigate } from 'react-router'
import { ClipLoader } from 'react-spinners'
import { useAuth } from './useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, isLoading } = useAuth()

  if (isLoading) return <></>
  if (!isAuth) {
    return <Navigate to={'/login'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
