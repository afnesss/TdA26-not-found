import type React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import EditBtn from '@/pages/dashboard/components/EditBtn'

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
  saveAriaLabel = 'Uložit změny',
  cancelAriaLabel = 'Zrušit úpravy',
  stopPropagation = true,
  className,
}: EditSaveCancelButtonsProps) => {
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
        aria-label={saveAriaLabel}
      />
      <EditBtn
        icon={X}
        onClick={runHandler(onCancel)}
        classNameBtn='hover:bg-destructive/20'
        iconClassName='text-destructive size-4 sm:size-5'
        disabled={cancelDisabled}
        aria-label={cancelAriaLabel}
      />
    </div>
  )
}

export default EditSaveCancelButtons
