import {
  approveAdminOrganizationRequest,
  getAdminOrganizationRequests,
  rejectAdminOrganizationRequest,
} from '@/api/queries/organizationQueries'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getRequestStatusUi } from '@/lib/adminStatus'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Inbox, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const AdminRequestsPage = () => {
  const { t, i18n } = useTranslation('admin')
  useTitle(t('requests.pageTitle'))

  const queryClient = useQueryClient()
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [rejectErrorById, setRejectErrorById] = useState<
    Record<string, string>
  >({})
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
      toast.success(t('requests.toasts.approved'))
    },
    onError: () => {
      toast.error(t('requests.toasts.approveError'))
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
      toast.success(t('requests.toasts.rejected'))
    },
    onError: () => {
      toast.error(t('requests.toasts.rejectError'))
    },
  })

  if (isLoading) {
    return <StateComp type='no-content' message={t('requests.loading')} />
  }

  if (isError || !data) {
    return <StateComp type='error' onAction={() => void refetch()} />
  }

  if (data.length === 0) {
    return (
      <div className='mx-auto max-w-7xl'>
        <StateComp type='no-content' message={t('requests.empty')} />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl space-y-5 md:space-y-6'>
      <HintPageText
        text={t('requests.heading')}
        icon={Inbox}
        spanText={String(data.length)}
      />

      <div className='grid gap-4'>
        {data.map((request) => {
          const statusUi = getRequestStatusUi(request.status)
          const noteValue = noteById[request.uuid] ?? request.adminNote ?? ''
          const rejectError = rejectErrorById[request.uuid] ?? ''
          const showActions = request.status === 'pending'

          return (
            <Card
              key={request.uuid}
              className='cursor-auto rounded-xl bg-background shadow-md'
            >
              <div
                className={cn(
                  headerLineHeight,
                  colorStyles.line[statusUi.line],
                )}
              />

              <CardContent className='px-5 py-4'>
                <div className='min-w-0 space-y-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-wrap items-center gap-3'>
                      <Label className='text-xl font-bold leading-tight text-foreground md:text-2xl'>
                        {request.name}
                      </Label>
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

                  <div className='flex items-start gap-3 text-sm text-muted-foreground md:text-base'>
                    <MapPin className='mt-1 size-4 shrink-0 text-destructive' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>
                        {request.city}, {request.country}
                      </span>
                      <span>{request.region}</span>
                      <span>{request.type}</span>
                    </div>
                  </div>

                  <div className='flex items-start gap-3 text-sm text-muted-foreground md:text-base'>
                    <Mail className='mt-1 size-4 shrink-0 text-primary' />
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      <span>{request.contactEmail}</span>
                      <span>{request.ownerName}</span>
                    </div>
                  </div>

                  {(showActions || noteValue) && (
                    <div className='space-y-2'>
                      <Label size='sm' className='block'>
                        {t('requests.adminNoteLabel')}
                      </Label>
                      <Textarea
                        placeholder={t('requests.adminNotePlaceholder')}
                        minRows={1}
                        value={noteValue}
                        disabled={!showActions}
                        className={cn(!showActions && 'mb-0 min-h-0')}
                        onChange={(event) => {
                          const value = event.target.value
                          setNoteById((prev) => ({
                            ...prev,
                            [request.uuid]: value,
                          }))

                          if (value.trim()) {
                            setRejectErrorById((prev) => ({
                              ...prev,
                              [request.uuid]: '',
                            }))
                          }
                        }}
                      />
                      {rejectError ? (
                        <p className='error-text -mt-2'>{rejectError}</p>
                      ) : null}
                    </div>
                  )}
                </div>

                <CardFooter className='items-center justify-between gap-3 border-none px-0 pb-0'>
                  <div className='shrink-0 text-xs font-semibold italic text-muted-foreground'>
                    <span className='font-medium text-gray-500'>
                      {t('requests.createdAt')}
                    </span>{' '}
                    {new Date(request.createdAt).toLocaleDateString(
                      i18n.resolvedLanguage === 'en' ? 'en-US' : 'cs-CZ',
                    )}
                  </div>

                  {showActions ? (
                    <div className='flex flex-row justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={rejectMutation.isPending}
                        onClick={() => {
                          if (!noteValue.trim()) {
                            setRejectErrorById((prev) => ({
                              ...prev,
                              [request.uuid]: t(
                                'requests.validation.rejectNoteRequired',
                              ),
                            }))
                            return
                          }

                          setRejectErrorById((prev) => ({
                            ...prev,
                            [request.uuid]: '',
                          }))

                          rejectMutation.mutate({
                            requestId: request.uuid,
                            adminNote: noteValue,
                          })
                        }}
                      >
                        {t('requests.actions.reject')}
                      </Button>
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
                        {t('requests.actions.approve')}
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                </CardFooter>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default AdminRequestsPage
