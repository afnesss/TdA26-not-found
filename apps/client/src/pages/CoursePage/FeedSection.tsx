import React from 'react'
import { colorStyles } from '@/lib/constants';
import { Calendar, Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { FeedItem } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type FeedSection = {
  feed: FeedItem[]
}

const FeedSection = ({feed}: FeedSection) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
        <section>
            <Label size="lg">Oznámení a novinky</Label>

          <div className='space-y-3'>
            {feed?.map((item) => {
              
              return (
                <div
                  key={item.uuid}
                  className='bg-background rounded-xl transition-all duration-300 p-5 border border-gray-100 hover:border-gray-200'
                >
                  <div className='flex items-start gap-4'>
                    <div className={cn('p-2.5 rounded-lg shrink-0', colorStyles.iconBg['accent-teal-light'])}>
                      <Bell className={colorStyles.text['accent-teal-light']} size={22} />
                    </div>
                    
                    <div className='flex-1 min-w-0'>
                      <p className='text-foreground leading-relaxed text-base mb-3'>
                        {item.message}
                      </p>
                      
                      <div className='flex items-center gap-3 text-sm text-gray-600'>
                        <span className='flex items-center gap-1.5'>
                          <Calendar size={14} className='text-primary' />
                          <span className='font-medium'>{formatDate(item.createdAt)}</span>
                        </span>
                        
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
  )
}

export default FeedSection
