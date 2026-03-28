import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userCheck, type AuthUser } from '@/api/queries/authQueries'

export const useAuth = () => {
  const { data, isPending, refetch } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => userCheck(),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const revalidateAuth = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    isAuth: Boolean(data?.username),
    isLoading: isPending,
    user: data ?? null,
    revalidateAuth,
  }
}
