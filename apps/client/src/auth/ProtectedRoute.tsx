import React from 'react'
import auth from './fakeAuth'
import { Navigate } from 'react-router'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!auth.isAutenticated()) {
    return <Navigate to={'/login'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
