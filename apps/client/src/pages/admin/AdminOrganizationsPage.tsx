import {
  deleteAdminOrganization,
  getAdminOrganizations,
  updateAdminOrganization,
} from '@/api/queries/organizationQueries'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import DeleteConfirmDialog from '@/components/ui/AlertDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useTitle } from '@/lib/dynamicTitleHook'
import { getOrganizationStatusUi } from '@/lib/adminStatus'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import CardDate from '@/pages/CoursesPage/components/CardDate'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Mail, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const AdminOrganizationsPage = () => {
  useTitle('Organizace')
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: getAdminOrganizations,
  })

  const statusMutation = useMutation({
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

  const deleteMutation = useMutation({
    mutationFn: (orgId: string) => deleteAdminOrganization(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
      toast.success('Organizace byla smazána')
    },
    onError: () => {
      toast.error('Organizaci se nepodařilo smazat')
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

      <div className='grid gap-4 md:grid-cols-2'>
        {data.map((organization) => {
          const statusUi = getOrganizationStatusUi(organization.status)
          const createdAt = new Date(organization.createdAt).toLocaleDateString(
            'cs-CZ',
          )
          const canDelete = organization.status === 'waiting'

          return (
            <Card
              key={organization.uuid}
              className='border border-border/60 rounded-xl shadow-md bg-background cursor-auto'
            >
              <div
                className={cn(
                  headerLineHeight,
                  colorStyles.line[statusUi.line],
                )}
              />

              <CardContent className='space-y-5 px-5 py-4'>
                <div className='min-w-0 space-y-2'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-wrap items-center gap-3'>
                      <h2 className='text-xl md:text-2xl font-bold text-foreground leading-tight'>
                        {organization.name}
                      </h2>
                      <Badge
                        variant='secondary'
                        className={cn(
                          'text-xs sm:text-sm',
                          statusUi.badgeClassName,
                        )}
                      >
                        {statusUi.label}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-foreground/90'>
                        /{organization.slug}
                      </span>
                      {canDelete ? (
                        <DeleteConfirmDialog
                          trigger={
                            <EditBtn
                              actionType='delete'
                              onClick={(e) => e?.stopPropagation()}
                              aria-label={`Smazat organizaci ${organization.name}`}
                            />
                          }
                          itemName={organization.name}
                          itemType='organizaci'
                          onConfirm={() => deleteMutation.mutate(organization.uuid)}
                          isLoading={deleteMutation.isPending}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className='flex items-center gap-3 text-sm md:text-base text-muted-foreground'>
                    <MapPin className='size-4 shrink-0 text-destructive' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>
                        {organization.city}, {organization.country}
                      </span>
                      <span>{organization.region}</span>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 text-sm md:text-base text-muted-foreground'>
                    <Mail className='mt-1 size-4 shrink-0 text-primary' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>{organization.contactEmail}</span>
                      <span>{organization.ownerName}</span>
                      <span>{organization.type}</span>
                    </div>
                  </div>
                </div>

                <CardFooter className='flex-col items-start gap-2'>
                  <div className='flex w-full items-center justify-between gap-3'>
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
                              disabled={
                                statusMutation.isPending || deleteMutation.isPending
                              }
                              className={cn(
                                'h-8 px-3 gap-0',
                                gridColorClasses,
                                !isCurrent &&
                                  'hover:bg-muted text-muted-foreground',
                              )}
                              onClick={() =>
                                statusMutation.mutate({
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
    </div>
  )
}

export default AdminOrganizationsPage
