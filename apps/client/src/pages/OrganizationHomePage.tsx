import { getOrganizationPublicInfo } from '@/api/queries/organizationQueries'
import LandingHero from '@/components/shared/LandingHero'
import StateComp from '@/components/shared/StateComp'
import { buildOrgCoursesPath, buildOrgInfoPath } from '@/lib/routes'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

const OrganizationHomePage = () => {
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['organization-public-info', orgSlug],
    queryFn: () => getOrganizationPublicInfo(orgSlug!),
    enabled: Boolean(orgSlug),
  })

  useTitle(data?.name || 'Organizace')

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám organizaci…' />
  }

  if (isError || !data) {
    return <StateComp type='not-found' onAction={() => void refetch()} />
  }

  const heroTitle =
    data.name === 'TdA' ? 'Think Different Academy' : data.name

  return (
    <LandingHero
      highlightedText={heroTitle}
      primaryCtaLabel='Procházet kurzy'
      onPrimaryCta={() => navigate(buildOrgCoursesPath(orgSlug))}
      secondaryCtaLabel='Info'
      onSecondaryCta={() => navigate(buildOrgInfoPath(orgSlug))}
    />
  )
}

export default OrganizationHomePage
