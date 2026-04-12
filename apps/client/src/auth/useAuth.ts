import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userCheck } from '@/api/queries/authQueries'
import type { ApiError } from '@/lib/types'

type AuthMeResponse = {
  actorType: 'platform_admin'
  username: string
  id?: string
  role?: string
  xp?: number
  level?: number
} | null

export const useAuth = () => {
  const { data, error, isPending, refetch } = useQuery<AuthMeResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => userCheck() as Promise<AuthMeResponse>,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const isUnauthorized = (error as ApiError | null)?.status === 401
  const effectiveUser = isUnauthorized ? null : data

  const revalidateAuth = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    user: effectiveUser,
    isAuth: Boolean(effectiveUser?.username),
    isLoading: isPending,
    revalidateAuth,
  }
}
