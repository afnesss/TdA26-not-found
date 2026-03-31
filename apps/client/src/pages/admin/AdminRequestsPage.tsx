import {
  approveAdminOrganizationRequest,
  getAdminOrganizationRequests,
  rejectAdminOrganizationRequest,
} from '@/api/queries/organizationQueries'
import CardDate from '@/pages/CoursesPage/components/CardDate'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTitle } from '@/lib/dynamicTitleHook'
import { getRequestStatusUi } from '@/lib/adminStatus'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Inbox, Mail, MapPin } from 'lucide-react'
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
    mutationFn: ({
      requestId,
      adminNote,
    }: {
      requestId: string
      adminNote?: string
    }) => approveAdminOrganizationRequest(requestId, adminNote),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin-organization-requests'],
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({
      requestId,
      adminNote,
    }: {
      requestId: string
      adminNote: string
    }) => rejectAdminOrganizationRequest(requestId, adminNote),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin-organization-requests'],
      })
    },
  })

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám žádosti…' />
  }

  if (isError || !data) {
    return <StateComp type='error' onAction={() => void refetch()} />
  }

  if (data.length === 0) {
    return (
      <div className='max-w-7xl mx-auto'>
        <StateComp
          type='no-content'
          message='Zatím zde nejsou žádné žádosti organizací'
        />
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

      <div className='grid gap-4'>
        {data.map((request) => {
          const statusUi = getRequestStatusUi(request.status)
          const noteValue = noteById[request.uuid] ?? request.adminNote ?? ''
          const isPending = request.status === 'pending'
          const showActions = isPending
          const createdAt = new Date(request.createdAt).toLocaleDateString(
            'cs-CZ',
          )

          return (
            <Card
              key={request.uuid}
              className='border border-border/60 rounded-xl shadow-md bg-background cursor-auto'
            >
              <div
                className={cn(
                  headerLineHeight,
                  colorStyles.line[statusUi.line],
                )}
              />

              <CardContent className='px-5 py-4 space-y-5'>
                <div className='space-y-3 min-w-0'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-wrap items-center gap-3'>
                      <h2 className='text-xl md:text-2xl font-bold text-foreground leading-tight'>
                        {request.name}
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
                    <div className='flex items-center gap-3'>
                      <span className='font-medium text-foreground/90'>
                        /{request.slug}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-3 text-sm md:text-base text-muted-foreground'>
                    <MapPin className='size-4 shrink-0 mt-1 text-destructive' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>
                        {request.city}, {request.country}
                      </span>
                      <span>{request.region}</span>
                      <span>{request.ownerName}</span>
                    </div>
                  </div>

                  <div className='flex items-start gap-3 text-sm md:text-base text-muted-foreground'>
                    <Mail className='size-4 shrink-0 mt-1 text-primary' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>{request.contactEmail}</span>
                      <span>{request.type}</span>
                    </div>
                  </div>

                  {noteValue && (
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
                  )}
                </div>

                <div className='shrink-0 text-xs font-semibold italic text-muted-foreground'>
                  <span className='font-medium text-gray-500'>Vytvořeno:</span>{' '}
                  {new Date(request.createdAt).toLocaleDateString('cs-CZ')}
                </div>

                {showActions && (
                  <CardFooter className='flex-col items-start gap-2 px-0 pb-0'>
                    <div className='flex w-full items-center justify-between gap-3'>
                      <div className='flex flex-col gap-2 sm:flex-row'>
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
                            rejectMutation.isPending || !noteValue.trim()
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
                    </div>
                  </CardFooter>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default AdminRequestsPage
