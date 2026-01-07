import FeedItemComp from '@/components/shared/FeedItemComp'
import { Label } from '@/components/ui/label'
import type { FeedItem } from '@/lib/schemas'

type FeedSectionProps = {
  feed: FeedItem[]
}

const FeedSection = ({ feed }: FeedSectionProps) => {
  return (
    <section>
      <Label size='xl' className='pl-3 md:pl-5'>
        Oznámení a novinky
      </Label>

      {/* <Feed feed={feed} type='classic' /> */}
      <div className='bg-background rounded-xl shadow-md p-1.5 sm:p-3 md:p-6'>
        <div className='space-y-4'>
          {feed.map((post) => (
            <FeedItemComp feedItem={post} key={post.uuid} type='classic' />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeedSection
