import { colorStyles } from '@/lib/constants'
import type { FeedItem } from '@/lib/schemas'
import { formatDate } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'
import EditBtn from '../../pages/dashboard/components/EditBtn'

const Feed = ({
  feed,
  type,
}: {
  feed: FeedItem[]
  type: 'classic' | 'edit'
}) => {
  return (
    <div className='bg-background rounded-xl shadow-md p-3 md:p-6'>
      <div className='space-y-4'>
        {feed.map((post) => (
          <div
            key={post.uuid}
            className={`px-4 py-3 md:p-4 rounded-lg border-l-4 ${
              post.type === 'manual'
                ? 'bg-primary/5 border-primary'
                : 'bg-secondary/5 border-secondary'
            }`}
          >
            <div className='flex items-center justify-between mb-2 gap-2'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    post.type === 'manual'
                      ? 'bg-primary/10 text-primary'
                      : `bg-secondary/20 ${colorStyles.text['secondary']}`
                  }`}
                >
                  {post.type === 'manual' ? 'Příspěvek' : 'Událost'}
                </span>
                <span className='text-sm text-gray-500'>
                  {formatDate(post.createdAt)}
                </span>
                {post.edited && post.updatedAt && (
                  <span className='text-xs text-gray-400 italic'>
                    (upraveno {formatDate(post.updatedAt)})
                  </span>
                )}
              </div>

              {/* Buttons */}
              {post.type === 'manual' && type === 'edit' && (
                <div className='flex gap-2 shrink-0'>
                  <EditBtn icon={Edit} />
                  <EditBtn
                    icon={Trash2}
                    bgColor='destructive'
                    classNameBtn='hover:bg-destructive/10'
                  />
                </div>
              )}
            </div>

            {/* Message text */}
            <p className='text-gray-900 text-sm md:text-md'>{post.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feed
