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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
            <Label size="xl" className='pl-3 md:pl-5'>Oznámení a novinky</Label>
                
            <div className="bg-white rounded-xl shadow-md p-3 md:p-6">
              <div className="space-y-4">
                {feed.map((post) => (
                  <div key={post.uuid} className={`p-4 rounded-lg border-l-4 ${
                    post.type === 'manual' ? 'bg-primary/5 border-primary' : 'bg-secondary/5 border-secondary'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            post.type === 'manual' ? 'bg-primary/10 text-primary' : `bg-secondary/20 ${colorStyles.text['secondary']}`
                          }`}>
                            {post.type === 'manual' ? 'Příspěvek' : 'Událost'}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                          {post.edited && (
                            <span className="text-xs text-gray-400 italic">
                              (upraveno {formatDate(post.updatedAt)})
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900">{post.message}</p>
                      </div>
                      {/* {post.type === 'manual' && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          {/* </div> */}
      </section>
  )
       
}


export default FeedSection
