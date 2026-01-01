import React from 'react'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { colorStyles } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Download, Link2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Material } from '@/lib/schemas/material'
import { useMediaQuery } from 'usehooks-ts'

type MaterialSectionProps = {
  materials?: Material[]
}
const MaterialsSection = ({ materials }: MaterialSectionProps) => {
  const isMd = useMediaQuery('(min-width: 768px)')

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return ''
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('image')) return '🖼️'
    return '📎'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  //   const downloadFile = async (url: string, filename: string) => {
  //   const res = await fetch(url);
  //   const blob = await res.blob();

  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  //   a.download = filename;
  //   a.click();

  //   URL.revokeObjectURL(a.href);
  // };
  return (
    <section>
      <Label size='xl' className='pl-3 md:pl-5'>
        Studijní materiály
      </Label>

      <div className='space-y-3'>
        {materials?.map((material) => {
          return (
            <div
              key={material.uuid}
              className='bg-background rounded-xl transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200'
            >
              <div className='flex gap-3 flex-row items-center justify-between'>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <div className={' rounded-lg shrink-0'}>
                    <div className='text-xl'>
                      {material.type === 'file' ? (
                        getFileIcon(material.mimeType)
                      ) : material.faviconUrl ? (
                        <img
                          src={material.faviconUrl}
                          alt=''
                          className='w-6 h-6 rounded'
                          loading='lazy'
                          referrerPolicy='no-referrer'
                          onError={(e) => {
                            ;(
                              e.currentTarget as HTMLImageElement
                            ).style.display = 'none'
                          }}
                        />
                      ) : (
                        '🔗'
                      )}
                    </div>
                  </div>

                  <div className='flex-1 group'>
                    <div className='flex items-center gap-1 max-w-full'>
                      <Label className='leading-snug wrap-break-word'>
                        {material.name}
                      </Label>
                      {material.description && (
                        <div className='relative w-fit'>
                          <Popover>
                            <PopoverTrigger>
                              {/* <Button variant={'ghost'}> */}
                              <Info
                                className='text-gray-400 hover:text-primary active:text-primary cursor-pointer ml-2 mt-2'
                                size={16}
                              />
                              {/* </Button> */}
                            </PopoverTrigger>
                            <PopoverContent
                              side={isMd ? 'right' : 'bottom'}
                              align='center'
                              sideOffset={isMd ? 4 : 8}
                              alignOffset={0}
                              collisionPadding={16}
                              avoidCollisions
                            >
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
                  <a
                    href={material.fileUrl}
                    download={material.originalFilename || material.name}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'bg-linear-to-br w-25 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2',
                      colorStyles.bg['accent-teal'],
                      colorStyles.text['accent-teal'],
                    )}
                  >
                    <Download size={14} />
                    <span>Stáhnout</span>
                  </a>
                ) : (
                  <a
                    href={material.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button
                      variant={'grid'}
                      size={'grid'}
                      className={cn(
                        'bg-linear-to-br w-25',
                        colorStyles.bg['accent-teal-light'],
                        colorStyles.text['accent-teal-light'],
                      )}
                    >
                      <Link2 size={14} />
                      <span>Otevřít</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default MaterialsSection
