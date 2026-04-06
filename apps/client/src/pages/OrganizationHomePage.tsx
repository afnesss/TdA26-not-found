import { getOrganizationPublicInfo } from '@/api/queries/organizationQueries'
import LandingHero from '@/components/shared/LandingHero'
import StateComp from '@/components/shared/StateComp'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursesPath, buildOrgInfoPath } from '@/lib/routes'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

const OrganizationHomePage = () => {
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const { t } = useTranslation('homepage')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['organization-public-info', orgSlug],
    queryFn: () => getOrganizationPublicInfo(orgSlug!),
    enabled: Boolean(orgSlug),
  })

  useTitle(data?.name || 'Organizace')

  if (isLoading) {
    return <StateComp type='no-content' message={t('states.loadingOrganization')} />
  }

  if (isError || !data) {
    return <StateComp type='not-found' onAction={() => void refetch()} />
  }

  const heroTitle =
    data.name === 'TdA' ? 'Think Different Academy' : data.name

  return (
    <LandingHero
      variant='organization'
      highlightedText={heroTitle}
      onPrimaryCta={() => navigate(buildOrgCoursesPath(orgSlug))}
      onSecondaryCta={() => navigate(buildOrgInfoPath(orgSlug))}
    />
  )
}

export default OrganizationHomePage
