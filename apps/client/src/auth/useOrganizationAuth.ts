import { organizationMe } from '@/api/queries/organizationQueries'
import { useQuery } from '@tanstack/react-query'

type UseOrganizationAuthOptions = {
  enabled?: boolean
  refetchInterval?: number | false
  refetchOnMount?: boolean | 'always'
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
}

export const useOrganizationAuth = (
  orgSlug?: string,
  options?: UseOrganizationAuthOptions,
) => {
  const { data, isPending, refetch, error } = useQuery({
    queryKey: ['org-auth', orgSlug],
    queryFn: () => organizationMe(orgSlug!),
    enabled: options?.enabled ?? Boolean(orgSlug),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: options?.refetchInterval,
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options?.refetchOnReconnect ?? false,
  })

  return {
    isAuth: Boolean(data?.organizationId),
    isLoading: isPending,
    me: data,
    error,
    revalidateAuth: refetch,
  }
}
