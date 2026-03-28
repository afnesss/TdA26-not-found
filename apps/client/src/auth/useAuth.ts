import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userCheck } from '@/api/queries/authQueries'

type AuthMeResponse = {
  actorType: 'platform_admin'
  username: string
} | null

export const useAuth = () => {
  const { data, isPending, refetch } = useQuery<AuthMeResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => userCheck() as Promise<AuthMeResponse>,
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

  return { isAuth: Boolean(data?.username), isLoading: isPending, revalidateAuth }
}
