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
    isAdmin: data?.actorType === 'organization_admin',
    isStaff:
      data?.actorType === 'organization_admin' ||
      (data?.actorType === 'organization_user' && data.role === 'lecturer'),
    user:
      data?.actorType === 'organization_user'
        ? {
            id: data.id,
            username: data.username,
            role: data.role,
            xp: data.role === 'student' ? (data.xp ?? 0) : undefined,
            level: data.role === 'student' ? (data.level ?? 1) : undefined,
            organizationId: data.organizationId,
            orgSlug: data.orgSlug,
          }
        : null,
    isLoading: isPending,
    me: data,
    error,
    revalidateAuth: refetch,
  }
}
