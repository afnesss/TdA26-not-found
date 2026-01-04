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
import EditBtn from '../../pages/dashboard/components/EditBtn'

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

const MaterialIcon = ({
  material,
  className,
}: {
  material: Material
  className?: string
}) => {
  return (
    <div className={cn('rounded-lg shrink-0 text-xl', className)}>
      {material.type === 'file' ? (
        getFileIcon(material.mimeType ?? 'application/pdf')
      ) : material.faviconUrl ? (
        <img
          src={material.faviconUrl}
          alt=''
          className='w-4 h-4 md:w-6 md:h-6 rounded'
          loading='lazy'
          referrerPolicy='no-referrer'
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        '🔗'
      )}
    </div>
  )
}

const MaterialCard = (props: MaterialCardProps) => {
  const { material, type } = props
  const isMd = useMediaQuery('(min-width: 768px)')

  return (
    <div className='bg-background rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow '>
      <div className='flex flex-col sm:flex-row items-start gap-2 md:gap-4'>
        {/* Icon */}
        <MaterialIcon material={material} className='hidden md:block mt-1' />
        {/* Content */}
        <div className='w-full'>
          {/* Title row with buttons */}
          <div className='flex items-start justify-between gap-2 sm:gap-4'>
            {/* Levá část - ikona, název, info */}
            <div className='flex items-center gap-1 flex-1 min-w-0'>
              <MaterialIcon
                material={material}
                className='md:hidden block mr-1 shrink-0'
              />

              <Label
                variant='title'
                size='md'
                className='wrap-break-word line-clamp-3 leading-snug'
              >
                {material.name}
              </Label>

              {type === 'classic' && material.description && (
                <div className='relative shrink-0'>
                  <Popover>
                    <PopoverTrigger>
                      <Info
                        className='text-gray-400 hover:text-primary active:text-primary cursor-pointer'
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

            {/* Buttons for edit type - same row as title */}
            {type === 'edit' && (
              <div className='flex items-center gap-1 '>
                {material.type === 'file' && props.onUpload && (
                  <EditBtn icon={Upload} onClick={props.onUpload} />
                )}
                {material.type === 'url' && props.onUpload && (
                  <EditBtn icon={Link2} onClick={props.onUpload} />
                )}
                <EditBtn icon={Edit} onClick={props.onEdit} />
                <EditBtn type='delete' onClick={props.onDelete} />
              </div>
            )}
          </div>

          {/* Description for edit type */}
          {type === 'edit' && material.description && (
            <p className='text-xs sm:text-sm block line-clamp-3 text-gray-600 leading-relaxed wrap-break-word mb-2'>
              {material.description}
            </p>
          )}

          {/* File size or URL */}
          <div className='flex items-center gap-4 text-xs sm:text-sm text-gray-500'>
            {material.type === 'file' && (
              <span className=''>{formatFileSize(material.sizeBytes)}</span>
            )}
            {material.type === 'url' && type === 'edit' && (
              <a
                href={material.url}
                className='text-primary hover:underline truncate'
                target='_blank'
                rel='noopener noreferrer'
              >
                {material.url}
              </a>
            )}
          </div>
        </div>

        {/* Download/Open button for classic type */}
        {type === 'classic' && (
          <div className='shrink-0'>
            {material.type === 'file' ? (
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
                    'bg-linear-to-br w-22 sm:w-25',
                    colorStyles.bg['accent-teal'],
                    colorStyles.text['accent-teal'],
                  )}
                >
                  <Download size={13} />
                  <span>Stáhnout</span>
                </Button>
              </a>
            ) : (
              <a href={material.url} target='_blank' rel='noopener noreferrer'>
                <Button
                  variant={'grid'}
                  size={'grid'}
                  className={cn(
                    'bg-linear-to-br w-22 sm:w-25',
                    colorStyles.bg['accent-teal-light'],
                    colorStyles.text['accent-teal-light'],
                  )}
                >
                  <Link2 size={13} />
                  <span>Otevřít</span>
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MaterialCard
