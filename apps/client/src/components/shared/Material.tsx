import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { colorStyles } from '@/lib/constants'
import type { Material } from '@/lib/schemas'
import { cn, formatFileSize, getFileIcon } from '@/lib/utils'
import { Download, Edit, Info, Link2, Trash2, Upload } from 'lucide-react'
import { useMediaQuery } from 'usehooks-ts'
import EditBtn from './EditBtn'

type MaterialCardProps =
  | {
      material: Material
      type: 'classic'
    }
  | {
      material: Material
      type: 'edit'
      onEdit?: () => void
      onDelete?: () => void
      onUpload?: () => void
    }

const MaterialCard = (props: MaterialCardProps) => {
  const { material, type } = props
  const isMd = useMediaQuery('(min-width: 768px)')

  return (
    <div className='bg-background rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-4 flex-1'>
          {/* Icon */}
          <div className='rounded-lg shrink-0'>
            <div className='text-xl'>
              {material.type === 'file' ? (
                getFileIcon(material.mimeType ?? 'application/pdf')
              ) : material.faviconUrl ? (
                <img
                  src={material.faviconUrl}
                  alt=''
                  className='w-6 h-6 rounded'
                  loading='lazy'
                  referrerPolicy='no-referrer'
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display =
                      'none'
                  }}
                />
              ) : (
                '🔗'
              )}
            </div>
          </div>

          {/* Content */}
          <div className='flex-1'>
            {/* Title */}
            <div className='flex items-center gap-1'>
              <Label variant='title' size='md' className='mb-1'>
                {material.name}
              </Label>

              {/* Popover for classic type */}
              {type === 'classic' && material.description && (
                <div className='relative w-fit'>
                  <Popover>
                    <PopoverTrigger>
                      <Info
                        className='text-gray-400 hover:text-primary active:text-primary cursor-pointer ml-2'
                        size={16}
                      />
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

            {/* Description for edit type */}
            {type === 'edit' && material.description && (
              <p className='text-gray-600 mb-2'>{material.description}</p>
            )}

            {/* File size or URL */}
            <div className='flex items-center gap-4 text-sm text-gray-500'>
              {material.type === 'file' && (
                <span className='font-medium'>
                  {formatFileSize(material.sizeBytes)}
                </span>
              )}
              {material.type === 'url' && type === 'edit' && (
                <a
                  href={material.url}
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {material.url}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {type === 'classic' ? (
          // Download/Open button for classic
          material.type === 'file' ? (
            <a
              href={material.fileUrl}
              download={material.originalFilename || material.name}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button
                variant={'grid'}
                size={'grid'}
                className={cn(
                  'bg-linear-to-br w-25',
                  colorStyles.bg['accent-teal'],
                  colorStyles.text['accent-teal'],
                )}
              >
                <Download size={14} />
                <span>Stáhnout</span>
              </Button>
            </a>
          ) : (
            <a href={material.url} target='_blank' rel='noopener noreferrer'>
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
          )
        ) : (
          // Edit buttons for dashboard
          <div className='flex gap-2'>
            {material.type === 'file' && props.onUpload && (
              <EditBtn icon={Upload} />
            )}
            {material.type === 'url' && props.onUpload && (
              <EditBtn icon={Link2} />
            )}
            <EditBtn icon={Edit} onClick={props.onEdit} />
            <EditBtn
              icon={Trash2}
              bgColor='destructive'
              classNameBtn='hover:bg-destructive/10'
              onClick={props.onDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MaterialCard
