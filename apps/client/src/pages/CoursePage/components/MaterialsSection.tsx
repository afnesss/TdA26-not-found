import React from 'react'
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { colorStyles } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Download, Link2,Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Material } from "@/lib/schemas/material";


type MaterialSectionProps ={
  materials?: Material[]
}
const MaterialsSection = ({materials}: MaterialSectionProps) => {

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  return (
        <section>

          <Label size='xl'>Studijní materiály</Label>

          <div className='space-y-3'>
            {materials?.map((material) => {

          return (
                <div
                  key={material.uuid}
                  className='bg-background rounded-xl transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200'
                >
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className={' rounded-lg shrink-0'}>
                        <div className='text-xl'>
                          {material.type === "file" ? (
                            getFileIcon(material.mimeType)
                          ) : material.faviconUrl ? (
                            <img
                              src={material.faviconUrl}
                              alt=""
                              className="w-6 h-6 rounded"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            "🔗"
                          )}
                        </div>
                      </div>
                      
                      <div className='flex-1 group '>
                        <div className='flex items-center gap-2'>
                          <Label>
                            {material.name}
                          </Label>
                          {material.description && (
                            <div className='relative w-fit'>
                              <Popover>
                                <PopoverTrigger>
                            {/* <Button variant={'ghost'}> */}
                              <Info className='text-gray-400 hover:text-primary active:text-primary cursor-pointer' size={16} />
                            {/* </Button> */}
                            </PopoverTrigger>
                            <PopoverContent side="right" align="center" sideOffset={4} alignOffset={0} avoidCollisions>
                                  {material.description}
                              </PopoverContent>
                              </Popover>
                            </div>
                          )}

                        </div>
                        {material.type === 'file' && (
                          <span className='text-xs text-gray-600 font-medium'>
                            {formatFileSize(material.sizeBytes)}
                          </span>
                        )}

                      </div>
                    </div>

                    {material.type === 'file' ? (
                      <Button 
                          variant={'grid'} size={'grid'}
                          className={cn(
                            'bg-linear-to-br w-25',
                            colorStyles.bg['accent-teal'],
                            colorStyles.text['accent-teal']
                          )}>
                        <Download size={14} />
                        <span>Stáhnout</span>
                      </Button>
                    ) : (
                    <Button
                          variant={'grid'} size={'grid'}
                          className={cn(
                            'bg-linear-to-br w-25',
                            colorStyles.bg['accent-teal-light'],
                            colorStyles.text['accent-teal-light']
                          )}>
                        <Link2 size={14} />
                        <span>Otevřít</span>
                      </Button>
                    )}
                  </div>


                </div>
              );
            })}
          </div>
        </section>
  )
}

export default MaterialsSection
