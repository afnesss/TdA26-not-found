import type { FeedItem } from '@/lib/schemas'
import { cn, formatDate } from '@/lib/utils'
import { Edit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import DeleteConfirmDialog from '../ui/AlertDialog'
import { handleCapitalizedInput } from '@/lib/capitalize'
import EditSaveCancelButtons from './EditSaveCancelButtons'
import { handleSaveOnEnter } from '@/pages/CoursePage/utils/helperFunctions'

const FeedItemComp = ({
  feedItem,
  type,
  onSave,
  isDraft,
  onCancelDraft,
  onDelete,
}: {
  feedItem: FeedItem
  type: 'classic' | 'edit'
  onSave?: (post: FeedItem) => Promise<void>
  onCancelDraft?: () => void
  isDraft?: true
  onDelete?: () => void
}) => {
  const { t } = useTranslation('common')
  const [editName, setEditName] = useState(isDraft ? true : false)
  const [editedFeed, setEditedFeed] = useState<FeedItem>(feedItem)
  const [messageError, setMessageError] = useState<string | null>(null)

  const displayFeed = type === 'edit' ? editedFeed : feedItem

  useEffect(() => {
    setEditedFeed(feedItem)
  }, [feedItem])

  const handleSave = async () => {
    if (editedFeed.message.trim() === '') {
      setMessageError(t('feedItem.messageRequired'))
      return
    }
    try {
      await onSave?.(editedFeed)
      setEditName(false)
    } catch {
      // Parent handles the error state; this prevents an uncaught rejection.
    }
  }

  const cancelEdit = () => {
    setEditName(false)
    setEditedFeed(feedItem)
    if (isDraft && onCancelDraft) {
      onCancelDraft()
    }
  }

  return (
    <div
      className={`px-3 py-2.5 sm:px-4 sm:py-3 md:p-4 rounded-lg border-l-4 transition-shadow ${
        displayFeed.type === 'manual'
          ? 'bg-primary/5 border-primary'
          : 'bg-secondary/7 border-secondary'
      }`}
    >
      <div className='flex items-start justify-between gap-2 sm:gap-3 mb-2'>
        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0'>
          <div className='flex gap-1.5 sm:gap-2 items-center'>
            <span
              className={cn(
                'px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-normal sm:font-medium self-start shrink-0 w-fit',
                displayFeed.type === 'manual'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/15 text-accent-teal-light',
              )}
            >
              {displayFeed.type === 'manual'
                ? t('feedItem.manualLabel')
                : t('feedItem.eventLabel')}
            </span>

            <span className='whitespace-nowrap text-[10px] sm:text-xs md:text-sm text-gray-500'>
              {formatDate(displayFeed.createdAt)}
            </span>
          </div>
          {displayFeed.edited && displayFeed.updatedAt && (
            <span className='text-[10px] sm:text-xs md:text-sm text-gray-400 italic whitespace-nowrap'>
              ({t('feedItem.editedAt', { date: formatDate(displayFeed.updatedAt) })})
            </span>
          )}
        </div>

        {displayFeed.type === 'manual' && type === 'edit' && (
          <div className='flex sm:gap-1 shrink-0'>
            {editName ? (
              <EditSaveCancelButtons
                onSave={handleSave}
                onCancel={cancelEdit}
                saveDisabled={
                  !isDraft &&
                  (editedFeed.message === feedItem.message ||
                    editedFeed.message.trim() === '')
                }
                saveAriaLabel={t('feedItem.saveAria')}
                className='flex gap-1'
              />
            ) : (
              <>
                <EditBtn
                  icon={Edit}
                  onClick={() => setEditName(true)}
                  aria-label={t('feedItem.editAria')}
                />
                <DeleteConfirmDialog
                  trigger={
                    <EditBtn
                      actionType='delete'
                      aria-label={t('feedItem.deleteAria')}
                    />
                  }
                  itemType={t('feedItem.itemType')}
                  onConfirm={() => {
                    onDelete?.()
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {editName && type === 'edit' ? (
        <>
          <Textarea
            className={cn(
              'text-xs sm:text-sm md:text-base p-2 sm:placeholder:text-sm md:placeholder:pt-0.5',
              messageError && 'border-destructive',
            )}
            variant='ghost'
            value={displayFeed.message}
            placeholder={t('feedItem.placeholder')}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const capitalizedValue = handleCapitalizedInput(
                e.target.value,
                editedFeed.message ?? '',
              )
              setEditedFeed({
                ...editedFeed,
                message: capitalizedValue,
              })
              if (capitalizedValue) {
                setMessageError(null)
              }
            }}
            onKeyDown={(e) => handleSaveOnEnter(e, handleSave, cancelEdit)}
            rows={3}
          />
          {messageError && <p className='error-text'>{messageError}</p>}
        </>
      ) : (
        <p className='text-gray-900 text-xs sm:text-sm md:text-base leading-relaxed wrap-break-word'>
          {displayFeed.message}
        </p>
      )}
    </div>
  )
}

export default FeedItemComp
