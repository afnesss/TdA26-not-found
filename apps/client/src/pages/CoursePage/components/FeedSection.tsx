import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import { Label } from '@/components/ui/label'
import type { FeedItem } from '@/lib/schemas'
import feedImg from '@/assets/disconnect-blue.svg'

type FeedSectionProps = {
  feed: FeedItem[]
  isConnected: boolean
}

const FeedSection = ({ feed, isConnected }: FeedSectionProps) => {
  return (
    <section>
      <Label size='lg' className='font-bold mb-2'>
        Oznámení
      </Label>
      <div className='flex items-center gap-2'>
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className='text-sm'>
          {isConnected ? 'Připojeno' : 'Odpojeno'}
        </span>
      </div>
      {feed && feed.length > 0 ? (
        <div className='bg-background rounded-xl shadow-md p-1.5 sm:p-3 md:p-5'>
          <div className='space-y-4'>
            {feed.map((post) => (
              <FeedItemComp feedItem={post} key={post.uuid} type='classic' />
            ))}
          </div>
        </div>
      ) : (
        <StateComp
          img={feedImg}
          iconClassName='w-12 h-12 md:w-13 h-13'
          type='no-content'
          message='Zatím žádné přispěvky'
          className='pt-8 pb-0'
        />
      )}
    </section>
  )
}

export default FeedSection
