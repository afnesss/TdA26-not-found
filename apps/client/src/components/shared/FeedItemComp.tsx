import type { FeedItem } from '@/lib/schemas'
import { cn, formatDate } from '@/lib/utils'
import { Check, Edit, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'
import DeleteConfirmDialog from '../ui/AlertDialog'

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
  const [editName, setEditName] = useState(isDraft ? true : false)
  const [editedFeed, setEditedFeed] = useState<FeedItem>(feedItem)
  const [messageError, setMessageError] = useState<string | null>(null)

  const displayFeed = type === 'edit' ? editedFeed : feedItem

  useEffect(() => {
    setEditedFeed(feedItem)
  }, [feedItem])
  const handleSave = async () => {
    if (editedFeed.message === '') {
      setMessageError('Příspěvek nesmí být prázdný')
      return
    }
    await onSave?.(editedFeed)
    setEditName(false)

    toast.success('Příspěvek uložen')
    //else - error toast?
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
      {/* Header */}
      <div className='flex items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2'>
        {/* Badges and dates */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-1 min-w-0'>
          {/* Badge */}
          <div className='flex gap-1.5 sm:gap-2 items-center'>
            <span
              className={cn(
                'px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-normal sm:font-medium self-start shrink-0 w-fit',
                displayFeed.type === 'manual'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/15 text-accent-teal-light',
              )}
            >
              {displayFeed.type === 'manual' ? 'Příspěvek' : 'Událost'}
            </span>

            {/* Dates */}

            <span className='whitespace-nowrap text-[10px] sm:text-xs md:text-sm text-gray-500'>
              {formatDate(displayFeed.createdAt)}
            </span>
          </div>
          {displayFeed.edited && displayFeed.updatedAt && (
            <span className='text-[10px] sm:text-xs md:text-sm text-gray-400 italic whitespace-nowrap'>
              (upraveno {formatDate(displayFeed.updatedAt)})
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {displayFeed.type === 'manual' && type === 'edit' && (
          <div className='flex gap-0.5 sm:gap-1 shrink-0'>
            {editName ? (
              <>
                <EditBtn
                  icon={Check}
                  classNameBtn='hover:bg-secondary/20'
                  iconClassName='text-secondary '
                  onClick={handleSave}
                />
                <EditBtn
                  icon={X}
                  onClick={cancelEdit}
                  classNameBtn='hover:bg-destructive/20'
                  iconClassName='text-destructive'
                  // disabled={saving}
                />
              </>
            ) : (
              <>
                <EditBtn icon={Edit} onClick={() => setEditName(true)} />
                <DeleteConfirmDialog
                  trigger={<EditBtn type='delete' />}
                  itemType='příspěvek'
                  onConfirm={() => {
                    onDelete?.()
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {editName && type === 'edit' ? (
        <>
          <Textarea
            className={cn(
              'text-xs sm:text-sm md:text-base p-2 sm:placeholder:text-sm md:placeholder:pt-0.5',
              messageError && 'border-destructive',
            )}
            variant={'ghost'}
            value={displayFeed.message}
            placeholder='Text příspěvku'
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setEditedFeed({
                ...editedFeed,
                message: (e.target as HTMLTextAreaElement).value,
              })
              if (editedFeed.message) {
                setMessageError(null)
              }
            }}
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
