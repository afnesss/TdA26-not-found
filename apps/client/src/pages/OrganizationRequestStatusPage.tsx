import { getOrganizationRequestStatus } from '@/api/queries/organizationQueries'
import StateComp from '@/components/shared/StateComp'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

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
    rejected:
      'Žádost byla zamítnuta. Níže je uveden důvod zamítnutí.',
  } as const

  const statusLabels = {
    pending: 'Čeká na schválení',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
  } as const

  const statusClasses = {
    pending: 'bg-secondary/20 text-primary border-primary/10',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  } as const

  return (
    <div className='mx-auto w-full max-w-4xl'>
      <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
        <Label variant='formTitle'>Stav žádosti</Label>
        <div className='px-5 sm:px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
          <div className='space-y-6'>
            <div className='space-y-3'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm uppercase tracking-[0.18em] text-muted-foreground'>
                    Organizace
                  </p>
                  <p className='text-2xl font-semibold text-foreground'>
                    {data.name}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold',
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

            {data.status === 'approved' && (
              <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-5'>
                <p className='font-semibold text-foreground'>Další postup</p>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Přístupové údaje odešleme ručně na kontaktní e-mail{' '}
                  <span className='font-semibold text-foreground'>
                    {data.contactEmail}
                  </span>
                  .
                </p>
              </div>
            )}

            {data.status === 'rejected' && data.adminNote && (
              <div className='rounded-2xl border border-destructive/20 bg-destructive/5 p-5'>
                <p className='font-semibold text-foreground'>Poznámka správce</p>
                <p className='mt-2 text-sm leading-6 text-foreground'>
                  {data.adminNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationRequestStatusPage
