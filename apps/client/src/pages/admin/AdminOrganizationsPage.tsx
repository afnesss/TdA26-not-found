import {
  getAdminOrganizations,
  updateAdminOrganization,
} from '@/api/queries/organizationQueries'
import CardDate from '@/pages/CoursesPage/components/CardDate'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useTitle } from '@/lib/dynamicTitleHook'
import { getOrganizationStatusUi } from '@/lib/adminStatus'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'

const AdminOrganizationsPage = () => {
  useTitle('Organizace')
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: getAdminOrganizations,
  })

  const mutation = useMutation({
    mutationFn: ({
      orgId,
      status,
    }: {
      orgId: string
      status: 'waiting' | 'onboarding' | 'active'
    }) => updateAdminOrganization(orgId, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
    },
  })

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám organizace…' />
  }

  if (isError || !data) {
    return <StateComp type='error' onAction={() => void refetch()} />
  }

  if (data.length === 0) {
    return (
      <div className='max-w-7xl mx-auto'>
        <StateComp
          type='no-content'
          message='Zatím zde nejsou žádné organizace'
        />
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto space-y-5 md:space-y-6'>
      <HintPageText
        text='Organizace'
        icon={Building2}
        spanText={String(data.length)}
      />

      {data.map((organization) => {
        const statusUi = getOrganizationStatusUi(organization.status)
        const createdAt = new Date(organization.createdAt).toLocaleDateString(
          'cs-CZ',
        )

        return (
          <Card
            key={organization.uuid}
            className='border border-border/60 rounded-xl shadow-md bg-background cursor-auto'
          >
            <div
              className={cn(headerLineHeight, colorStyles.line[statusUi.line])}
            />

            <CardContent className='p-5 md:p-6 space-y-5'>
              <div className='space-y-3 min-w-0'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-wrap items-center gap-3'>
                    <h2 className='text-xl md:text-2xl font-bold text-foreground leading-tight'>
                      {organization.name}
                    </h2>
                    <Badge
                      variant='secondary'
                      className={statusUi.badgeClassName}
                    >
                      {statusUi.label}
                    </Badge>
                  </div>

                  {/* <div className='shrink-0 text-right lg:hidden'>
                    <div className='text-xs text-gray-500'>Vytvořeno</div>
                    <div className='text-xs md:text-sm font-medium text-foreground'>
                      {createdAt}
                    </div>
                  </div> */}
                </div>

                <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm md:text-base text-muted-foreground'>
                  <span className='font-medium text-foreground/90'>
                    /{organization.slug}
                  </span>
                  <span>
                    {organization.city}, {organization.country}
                  </span>
                  <span>{organization.region}</span>
                </div>

                <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm md:text-base text-muted-foreground'>
                  <span>{organization.contactEmail}</span>
                  <span>{organization.ownerName}</span>
                  <span>{organization.type}</span>
                </div>
              </div>

              <CardFooter className='flex-col items-start gap-2'>
                <div className='flex w-full items-center justify-between gap-3'>
                  {/* <div className='block sm:hidden'>
                    <CardDate date={createdAt} />
                  </div> */}
                  <div className='hidden sm:block'>
                    <CardDate label='Vytvořeno' date={createdAt} />
                  </div>

                  <div className='flex flex-wrap justify-end gap-2'>
                    {(['waiting', 'onboarding', 'active'] as const).map(
                      (status) => {
                        const buttonUi = getOrganizationStatusUi(status)
                        const isCurrent = organization.status === status
                        const gridColorClasses = isCurrent
                          ? [
                              'bg-linear-to-br',
                              colorStyles.bg[buttonUi.line],
                              colorStyles.text[buttonUi.line],
                            ]
                          : []

                        return (
                          <Button
                            key={status}
                            variant={isCurrent ? 'grid' : 'outline'}
                            size='sm'
                            disabled={mutation.isPending}
                            className={cn(
                              'h-8 px-3 gap-0',
                              gridColorClasses,
                              !isCurrent &&
                                'hover:bg-muted text-muted-foreground',
                            )}
                            onClick={() =>
                              mutation.mutate({
                                orgId: organization.uuid,
                                status,
                              })
                            }
                          >
                            <span className='inline text-sm font-medium'>
                              {buttonUi.label}
                            </span>
                          </Button>
                        )
                      },
                    )}
                  </div>
                </div>
              </CardFooter>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default AdminOrganizationsPage
