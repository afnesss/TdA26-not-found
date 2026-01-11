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

type DeleteConfirmDialogProps = {
  // Тригер (кнопка видалення)
  trigger: ReactNode

  // Назва об'єкта що видаляється
  itemName?: string

  // Тип об'єкта (квіз, матеріал, курс...)
  itemType?: string

  // Кастомний заголовок
  title?: string

  // Кастомний опис
  description?: string

  // Функція видалення
  onConfirm: () => void | Promise<void>

  // Текст кнопок
  cancelText?: string
  confirmText?: string

  // Чи показувати loading стан
  isLoading?: boolean
}

const DeleteConfirmDialog = ({
  trigger,
  itemName,
  itemType = 'položku',
  title,
  description,
  onConfirm,
  cancelText = 'Zrušit',
  confirmText = 'Smazat',
  isLoading = false,
}: DeleteConfirmDialogProps) => {
  const defaultTitle = `Odstranit ${itemType}?`
  const defaultDescription = itemName
    ? `Opravdu chcete smazat ${itemType} "${itemName}"?`
    : `Opravdu chcete smazat tento ${itemType}?`

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className='rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription className='text-gray-600'>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className={cn(
              'w-18 h-8 font-semibold border hover:bg-gray-200 border-gray-300 shadow-sm',
            )}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className='bg-destructive/80 text-destructive-foreground hover:bg-destructive w-18 h-8 rounded-xl cursor-pointer shadow-sm'
          >
            {isLoading ? 'Mazání...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteConfirmDialog
