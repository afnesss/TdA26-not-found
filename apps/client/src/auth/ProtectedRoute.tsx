import React from 'react'
import { Navigate } from 'react-router'
import { useAuth } from './useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, isLoading, user } = useAuth()

  if (isLoading) return <></>
  if (!isAuth || user?.role !== 'lecturer') {
    return <Navigate to={'/login'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
