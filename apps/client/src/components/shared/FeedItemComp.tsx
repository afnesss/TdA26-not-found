import { colorStyles } from '@/lib/constants'
import type { FeedItem } from '@/lib/schemas'
import { formatDate } from '@/lib/utils'
import { Check, Edit } from 'lucide-react'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { useState } from 'react'
import { Textarea } from '../ui/textarea'

const FeedItemComp = ({
  feedItem,
  type,
}: {
  feedItem: FeedItem
  type: 'classic' | 'edit'
}) => {
  const [editName, setEditName] = useState(false)
  const [editedFeed, setEditedFeed] = useState<FeedItem>(feedItem)

  const displayFeed = type === 'edit' ? editedFeed : feedItem

  return (
    <div
      className={`px-4 py-3 md:p-4 rounded-lg border-l-4 ${
        displayFeed.type === 'manual'
          ? 'bg-primary/5 border-primary'
          : 'bg-secondary/5 border-secondary'
      }`}
    >
      <div className='flex items-center justify-between mb-2 gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              displayFeed.type === 'manual'
                ? 'bg-primary/10 text-primary'
                : `bg-secondary/20 ${colorStyles.text['secondary']}`
            }`}
          >
            {displayFeed.type === 'manual' ? 'Příspěvek' : 'Událost'}
          </span>
          <span className='text-xs sm:text-sm text-gray-500'>
            {formatDate(displayFeed.createdAt)}
          </span>
          {displayFeed.edited && displayFeed.updatedAt && (
            <span className='text-xs text-gray-400 italic'>
              (upraveno {formatDate(displayFeed.updatedAt)})
            </span>
          )}
        </div>

        {/* Buttons */}
        {displayFeed.type === 'manual' && type === 'edit' && (
          <div className='flex gap-1 shrink-0'>
            {editName ? (
              <EditBtn
                icon={Check}
                iconClassName='text-secondary size-5 stroke-[2.5]'
                onClick={() => setEditName(false)}
              />
            ) : (
              <EditBtn icon={Edit} onClick={() => setEditName(true)} />
            )}
            <EditBtn type='delete' />
          </div>
        )}
      </div>
      {editName && type === 'edit' ? (
        <Textarea
          className=' text-sm md:text-md'
          variant={'ghost'}
          value={displayFeed.message}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setEditedFeed({
              ...editedFeed,
              message: (e.target as HTMLTextAreaElement).value,
            })
          }
        />
      ) : (
        <p className='text-gray-900 text-sm md:text-md'>
          {displayFeed.message}
        </p>
      )}
    </div>
  )
}

export default FeedItemComp
