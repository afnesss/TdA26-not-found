import Feed from '@/components/shared/Feed'
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

      <Feed feed={feed} type='classic' />
    </section>
  )
}

export default FeedSection
