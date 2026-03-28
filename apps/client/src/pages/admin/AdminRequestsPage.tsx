import {
  approveAdminOrganizationRequest,
  getAdminOrganizationRequests,
  rejectAdminOrganizationRequest,
} from '@/api/queries/organizationQueries'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTitle } from '@/lib/dynamicTitleHook'
import { getRequestStatusUi } from '@/lib/adminStatus'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { useState } from 'react'

const AdminRequestsPage = () => {
  useTitle('Žádosti organizací')
  const queryClient = useQueryClient()
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-organization-requests'],
    queryFn: getAdminOrganizationRequests,
  })

  const approveMutation = useMutation({
    mutationFn: ({ requestId, adminNote }: { requestId: string; adminNote?: string }) =>
      approveAdminOrganizationRequest(requestId, adminNote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-organization-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, adminNote }: { requestId: string; adminNote: string }) =>
      rejectAdminOrganizationRequest(requestId, adminNote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-organization-requests'] })
    },
  })

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám žádosti…' />
  }

  if (isError || !data) return <StateComp type='error' onAction={() => void refetch()} />

  if (data.length === 0) {
    return (
      <div className='max-w-7xl mx-auto'>
        <StateComp type='no-content' message='Zatím zde nejsou žádné žádosti organizací' />
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto space-y-5 md:space-y-6'>
      <HintPageText
        text='Žádosti organizací'
        icon={Inbox}
        spanText={String(data.length)}
      />

      {data.map((request) => {
        const statusUi = getRequestStatusUi(request.status)
        const noteValue = noteById[request.uuid] ?? request.adminNote ?? ''
        const isPending = request.status === 'pending'
        const showActions = isPending

        return (
          <Card
            key={request.uuid}
            className='border border-border/60 rounded-xl shadow-md bg-background cursor-auto'
          >
            <div className={cn(headerLineHeight, colorStyles.line[statusUi.line])} />

            <CardContent className='p-4 md:p-5 space-y-4'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                <div className='space-y-2 min-w-0'>
                  <div className='flex flex-wrap items-center gap-2.5'>
                    <h2 className='text-lg md:text-xl font-bold text-foreground leading-tight'>
                      {request.name}
                    </h2>
                    <Badge
                      variant='secondary'
                      className={statusUi.badgeClassName}
                    >
                      {statusUi.label}
                    </Badge>
                  </div>

                  <div className='flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground'>
                    <span className='font-medium text-foreground/90'>
                      /{request.slug}
                    </span>
                    <span>
                      {request.city}, {request.country}
                    </span>
                    <span>{request.ownerName}</span>
                  </div>

                  <div className='flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground'>
                    <span>{request.contactEmail}</span>
                    <span>{request.type}</span>
                    <span>{request.region}</span>
                  </div>
                </div>

                <div className='shrink-0 text-sm text-muted-foreground'>
                  <span className='font-medium text-foreground/90'>Vytvořeno:</span>{' '}
                  {new Date(request.createdAt).toLocaleDateString('cs-CZ')}
                </div>
              </div>

              <div
                className={cn(
                  'grid gap-3',
                  showActions && 'xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end',
                )}
              >
                <div className='space-y-2'>
                  <Label size='sm' className='block'>
                    Poznámka správce
                  </Label>
                  <Textarea
                    placeholder='Poznámka pro schválení nebo důvod zamítnutí'
                    minRows={showActions ? 2 : 1}
                    value={noteValue}
                    disabled={!showActions}
                    className={cn(!showActions && 'min-h-0')}
                    onChange={(event) =>
                      setNoteById((prev) => ({
                        ...prev,
                        [request.uuid]: event.target.value,
                      }))
                    }
                  />
                </div>

                {showActions && (
                  <div className='flex flex-col sm:flex-row xl:flex-col gap-2 xl:min-w-40'>
                    <Button
                      variant='primary'
                      size='sm'
                      disabled={approveMutation.isPending}
                      onClick={() =>
                        approveMutation.mutate({
                          requestId: request.uuid,
                          adminNote: noteValue,
                        })
                      }
                    >
                      Schválit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={
                        rejectMutation.isPending ||
                        !noteValue.trim()
                      }
                      onClick={() =>
                        rejectMutation.mutate({
                          requestId: request.uuid,
                          adminNote: noteValue,
                        })
                      }
                    >
                      Zamítnout
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default AdminRequestsPage
