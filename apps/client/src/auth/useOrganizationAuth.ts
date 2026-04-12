import { organizationMe } from '@/api/queries/organizationQueries'
import { useQuery } from '@tanstack/react-query'
import type { ApiError } from '@/lib/types'

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

  const isUnauthorized = (error as ApiError | null)?.status === 401
  const me = isUnauthorized ? null : data

  return {
    isAuth: Boolean(me?.organizationId),
    isAdmin: me?.actorType === 'organization_admin',
    isStaff:
      me?.actorType === 'organization_admin' ||
      (me?.actorType === 'organization_user' && me.role === 'lecturer'),
    user:
      me?.actorType === 'organization_user'
        ? {
            id: me.id,
            username: me.username,
            role: me.role,
            xp: me.role === 'student' ? (me.xp ?? 0) : undefined,
            level: me.role === 'student' ? (me.level ?? 1) : undefined,
            organizationId: me.organizationId,
            orgSlug: me.orgSlug,
          }
        : null,
    isLoading: isPending,
    me,
    error,
    revalidateAuth: refetch,
  }
}
