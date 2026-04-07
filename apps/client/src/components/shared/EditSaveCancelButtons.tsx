import type React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { useTranslation } from 'react-i18next'

type EditSaveCancelButtonsProps = {
  onSave?: (e?: React.MouseEvent) => void
  onCancel?: (e?: React.MouseEvent) => void
  saveDisabled?: boolean
  cancelDisabled?: boolean
  saveAriaLabel?: string
  cancelAriaLabel?: string
  stopPropagation?: boolean
  className?: string
}

const EditSaveCancelButtons = ({
  onSave,
  onCancel,
  saveDisabled,
  cancelDisabled,
  saveAriaLabel,
  cancelAriaLabel,
  stopPropagation = true,
  className,
}: EditSaveCancelButtonsProps) => {
  const { t } = useTranslation('common')
  const resolvedSaveAriaLabel =
    saveAriaLabel ?? t('editControls.saveChanges')
  const resolvedCancelAriaLabel =
    cancelAriaLabel ?? t('editControls.cancelEdits')

  const runHandler =
    (handler?: (e?: React.MouseEvent) => void) => (e?: React.MouseEvent) => {
      if (stopPropagation) e?.stopPropagation()
      handler?.(e)
    }

  return (
    <div className={cn(className)}>
      <EditBtn
        icon={Check}
        onClick={runHandler(onSave)}
        classNameBtn='hover:bg-secondary/20'
        iconClassName='text-secondary size-4 sm:size-5'
        disabled={saveDisabled}
        aria-label={resolvedSaveAriaLabel}
      />
      <EditBtn
        icon={X}
        onClick={runHandler(onCancel)}
        classNameBtn='hover:bg-destructive/20'
        iconClassName='text-destructive size-4 sm:size-5'
        disabled={cancelDisabled}
        aria-label={resolvedCancelAriaLabel}
      />
    </div>
  )
}

export default EditSaveCancelButtons
