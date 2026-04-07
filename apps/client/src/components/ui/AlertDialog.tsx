import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { ReactNode } from 'react'
import buttonVariants from './variants'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type DeleteConfirmDialogProps = {
  trigger: ReactNode
  itemName?: string
  itemType?: string
  title?: string
  description?: string
  onConfirm: () => void | Promise<void>
  cancelText?: string
  confirmText?: string

  isLoading?: boolean
}

const DeleteConfirmDialog = ({
  trigger,
  itemName,
  itemType,
  title,
  description,
  onConfirm,
  cancelText,
  confirmText,
  isLoading = false,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation('common')
  const effectiveItemType = itemType ?? t('deleteConfirm.itemTypeDefault')
  const defaultTitle = t('deleteConfirm.title', {
    itemType: effectiveItemType,
  })
  const defaultDescription = itemName
    ? t('deleteConfirm.descriptionNamed', {
        itemType: effectiveItemType,
        itemName,
      })
    : t('deleteConfirm.descriptionUnnamed', {
        itemType: effectiveItemType,
      })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className='rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription className='text-gray-600 text-xs md:text-sm'>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={(e) => e?.stopPropagation()}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-15 h-7 md:w-18 md:h-8 font-semibold shadow-sm',
            )}
          >
            {cancelText ?? t('actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            disabled={isLoading}
            className='bg-destructive/80 text-destructive-foreground hover:bg-destructive w-15 h-7 md:w-18 md:h-8 rounded-xl cursor-pointer text-xs sm:text-sm shadow-sm'
          >
            {isLoading
              ? t('deleteConfirm.deleting')
              : (confirmText ?? t('actions.delete'))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteConfirmDialog
