import { getOrganizationRequestStatus } from '@/api/queries/organizationQueries'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgLoginPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Mail, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

const safeValue = (value?: string) => {
  const normalized = value?.trim()
  return normalized ? normalized : '—'
}

const OrganizationRequestStatusPage = () => {
  const { requestId } = useParams<{ requestId: string }>()
  useTitle('Stav žádosti')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['organization-request-status', requestId],
    queryFn: () => getOrganizationRequestStatus(requestId!),
    enabled: Boolean(requestId),
    retry: false,
  })

  if (!requestId) {
    return <StateComp type='not-found' />
  }

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám stav žádosti…' />
  }

  if (isError || !data) {
    return <StateComp type='error' onAction={() => void refetch()} />
  }

  const messages = {
    pending:
      'Žádost jsme přijali a čeká na kontrolu. Jakmile bude zpracována, objeví se zde výsledek.',
    approved:
      'Žádost byla schválena. Přístupové údaje budou nebo již byly ručně odeslány na kontaktní e-mail.',
    rejected: 'Žádost byla zamítnuta. Níže je uveden důvod zamítnutí.',
  } as const

  const statusLabels = {
    pending: 'Čeká na schválení',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
  } as const

  const statusClasses = {
    pending: 'bg-accent-teal/30 text-[#246969]',
    approved: 'bg-secondary/45 text-[#2D8B6B]',
    rejected: 'bg-destructive/15 text-destructive',
  } as const

  const locationParts = [
    safeValue(data.city),
    safeValue(data.country),
    safeValue(data.region),
  ].filter((value) => value !== '—')

  return (
    <div className='mx-auto w-full max-w-4xl'>
      <div className='overflow-hidden rounded-2xl bg-background/80 shadow-xl backdrop-blur-xl md:shadow-xl'>
        <Label variant='formTitle'>Stav žádosti</Label>
        <div className='space-y-4 sm:space-y-5 bg-background/95 px-4 py-4 sm:px-6 lg:px-8 md:py-8'>
          <div className='space-y-3'>
            <div className='flex gap-2 flex-row items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground'>
                  Organizace
                </p>
                <p className='text-2xl font-semibold text-foreground'>
                  {safeValue(data.name)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold',
                  statusClasses[data.status],
                )}
              >
                {statusLabels[data.status]}
              </span>
            </div>

            <p className='text-base leading-7 text-muted-foreground'>
              {messages[data.status]}
            </p>
          </div>

          <div className='space-y-4 rounded-2xl bg-muted/30 p-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Veřejná adresa
                </p>
                <p className='wrap-break-word text-sm md:text-base leading-6 text-foreground font-semibold'>
                  /{safeValue(data.slug)}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Typ pobočky
                </p>
                <p className='wrap-break-word text-sm md:text-base leading-6  text-foreground font-semibold'>
                  {safeValue(data.type)}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 text-sm text-muted-foreground md:text-base'>
              <MapPin className='mt-1 size-4 shrink-0 text-destructive' />
              <div className='flex flex-wrap gap-x-4 gap-y-1'>
                <span>
                  {locationParts.length > 0 ? locationParts.join(', ') : '—'}
                </span>
                <span>{safeValue(data.address)}</span>
                <span>{safeValue(data.postalCode)}</span>
              </div>
            </div>

            <div className='flex items-start gap-3 text-sm text-muted-foreground md:text-base'>
              <Mail className='mt-1 size-4 shrink-0 text-primary' />
              <div className='flex flex-wrap gap-x-4 gap-y-1'>
                <span>{safeValue(data.contactEmail)}</span>
                <span>{safeValue(data.ownerName)}</span>
              </div>
            </div>
          </div>

          {data.status === 'approved' && (
            <div className=' flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-secondary/20 p-5'>
              <div className='flex flex-col'>
                <p className='font-semibold text-[#2D8B6B]'>Další postup</p>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Přístupové údaje odešleme ručně na kontaktní e-mail{' '}
                  <span className='font-semibold text-foreground'>
                    {safeValue(data.contactEmail)}
                  </span>
                  .
                </p>
              </div>
              <Button asChild variant='primary' size='primary' className='mt-4'>
                <Link to={buildOrgLoginPath(data.slug)}>
                  Přihlášít se do organizace
                </Link>
              </Button>
            </div>
          )}

          {data.status === 'rejected' && data.adminNote && (
            <div className='rounded-2xl bg-destructive/10 p-5'>
              <p className='font-semibold text-foreground'>Poznámka správce</p>
              <p className='mt-2 text-sm font-semibold leading-6 text-destructive'>
                {data.adminNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrganizationRequestStatusPage
