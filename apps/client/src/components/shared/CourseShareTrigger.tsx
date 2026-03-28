import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  getCourseShareLink,
  regenerateCourseShareLink,
} from '@/api/queries/courseQueries'
import { cn } from '@/lib/utils'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import type { ApiError } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, QrCode, RefreshCw, Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

type QrImageProps = {
  value?: string
  size: number
  className?: string
}

const QrImage = ({ value, size, className }: QrImageProps) => {
  const [qrState, setQrState] = useState<{ value?: string; src: string }>({
    value: undefined,
    src: '',
  })

  useEffect(() => {
    let ignore = false

    if (!value) {
      return
    }

    void QRCode.toDataURL(value, {
      margin: 1,
      width: size,
      color: {
        dark: '#0f2f46',
        light: '#ffffff',
      },
    }).then((dataUrl: string) => {
      if (!ignore) {
        setQrState({
          value,
          src: dataUrl,
        })
      }
    })

    return () => {
      ignore = true
    }
  }, [size, value])

  if (!value || qrState.value !== value || !qrState.src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted text-primary',
          className,
        )}
        style={{ width: size, height: size }}
      >
        <QrCode className='size-5' />
      </div>
    )
  }

  return (
    <img
      src={qrState.src}
      alt='QR kód pro sdílení kurzu'
      width={size}
      height={size}
      className={cn('rounded-md border border-border/60 bg-white', className)}
    />
  )
}

type CourseShareTriggerProps = {
  courseId: string
  courseName: string
  orgSlug?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const CourseShareTrigger = ({
  courseId,
  courseName,
  orgSlug,
  className,
  size = 'sm',
}: CourseShareTriggerProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const queryKey = ['course-share-link', courseId]

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getCourseShareLink(courseId, orgSlug),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  })

  const shareMutation = useMutation({
    mutationFn: () => regenerateCourseShareLink(courseId, orgSlug),
    onSuccess: (nextData) => {
      queryClient.setQueryData(queryKey, nextData)
      toast.success('QR kód byl obnoven')
    },
    onError: (error: ApiError) => {
      toast.error(error.body?.message ?? 'Nepodařilo se obnovit QR kód')
    },
  })

  const shareUrl = shareMutation.data?.shareUrl ?? data?.shareUrl

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Odkaz byl zkopírován')
    } catch {
      toast.error('Nepodařilo se zkopírovat odkaz')
    }
  }

  const handleShare = async () => {
    if (!shareUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: courseName,
          text: `Otevřít kurz ${courseName}`,
          url: shareUrl,
        })
        return
      } catch {
        // Fallback to copy when the native share sheet is cancelled or unavailable.
      }
    }

    await handleCopy()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <EditBtn
        icon={QrCode}
        size={size}
        onClick={(event) => {
          event?.stopPropagation()
          setOpen(true)
        }}
        classNameBtn={cn('shrink-0', className)}
        iconClassName='text-primary'
      />

      <AlertDialogContent className='max-w-md rounded-2xl'>
        <div className='absolute right-4 top-4 z-10'>
          <AlertDialogCancel asChild>
            <span>
              <EditBtn
                icon={X}
                classNameBtn='hover:bg-destructive/20'
                iconClassName='text-destructive size-4 sm:size-5'
                onClick={(event) => {
                  event?.stopPropagation()
                  setOpen(false)
                }}
              />
            </span>
          </AlertDialogCancel>
        </div>

        <AlertDialogHeader>
          <AlertDialogTitle>QR kód kurzu</AlertDialogTitle>
          <AlertDialogDescription>
            Studenti se přes QR dostanou přímo na kurz bez ručního hledání.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='flex flex-col items-center gap-4'>
          <div className='rounded-2xl border border-border/60 bg-white p-3 shadow-sm'>
            <QrImage value={shareUrl} size={248} className='rounded-xl' />
          </div>
          <p
            className={cn(
              'text-center text-sm font-medium',
              isError && 'text-destructive',
            )}
          >
            {isError
              ? ' Nepodařilo se načíst odkaz pro sdílení.'
              : isLoading || shareMutation.isPending
                ? 'Připravuji QR kód...'
                : courseName}
          </p>
        </div>

        <AlertDialogFooter className='flex-wrap justify-center'>
          <Button
            variant='outline'
            size='sm'
            onClick={(event) => {
              event.stopPropagation()
              void handleCopy()
            }}
            disabled={!shareUrl}
          >
            <Copy className='size-4' />
            Kopírovat odkaz
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={(event) => {
              event.stopPropagation()
              void handleShare()
            }}
            disabled={!shareUrl}
          >
            <Share2 className='size-4' />
            Sdílet odkaz
          </Button>
          <Button
            variant='primary'
            size='sm'
            onClick={(event) => {
              event.stopPropagation()
              void shareMutation.mutateAsync().catch(() => undefined)
            }}
            disabled={shareMutation.isPending}
          >
            <RefreshCw
              className={cn(
                'size-4',
                shareMutation.isPending && 'animate-spin',
              )}
            />
            Obnovit QR
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CourseShareTrigger
