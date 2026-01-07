import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Material } from '@/lib/schemas'
import { cn, formatFileSize, getFileIcon } from '@/lib/utils'
import {
  Download,
  Edit,
  ExternalLink,
  Info,
  Link,
  Link2,
  Upload,
} from 'lucide-react'
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
    <div className='bg-background rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start gap-2 md:gap-4'>
        {/* Icon - завжди зліва для classic */}
        <MaterialIcon
          material={material}
          className={cn('mt-1', 'hidden sm:block')}
        />

        {/* Content */}
        <div className='flex-1 min-w-0'>
          {/* Title row */}
          <div className='flex items-center justify-between gap-2 sm:gap-4 mb-1'>
            {/* Title */}
            <div className='flex items-center gap-1 min-w-0'>
              <MaterialIcon
                material={material}
                className='sm:hidden block mr-1 shrink-0'
              />

              <Label
                variant='title'
                size='md'
                className='wrap-break-word line-clamp-3 leading-snug inline-block'
              >
                {material.name}
              </Label>
            </div>

            {/* Buttons справа */}
            {type === 'edit' ? (
              <div className='flex items-center gap-1 shrink-0'>
                {material.type === 'file' && props.onUpload && (
                  <EditBtn icon={Upload} onClick={props.onUpload} />
                )}
                {material.type === 'url' && props.onUpload && (
                  <EditBtn icon={Link2} onClick={props.onUpload} />
                )}
                <EditBtn icon={Edit} onClick={props.onEdit} />
                <EditBtn type='delete' onClick={props.onDelete} />
              </div>
            ) : (
              <div className='shrink-0'>
                {material.type === 'file' ? (
                  <a
                    href={material.fileUrl}
                    download={material.originalFilename || material.name}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <EditBtn icon={Download} />
                  </a>
                ) : (
                  <a
                    href={material.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <EditBtn icon={ExternalLink} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Description - для ОБОХ режимів */}
          {material.description && (
            <p className='text-xs sm:text-sm block line-clamp-3 text-gray-600 leading-relaxed wrap-break-word mb-2'>
              {material.description}
            </p>
          )}

          {/* File size or URL - для ОБОХ режимів */}
          <div className='flex items-center gap-4 text-xs sm:text-sm text-gray-500'>
            {material.type === 'file' && (
              <span>{formatFileSize(material.sizeBytes)}</span>
            )}
            {material.type === 'url' && (
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
      </div>
    </div>
  )
}

export default MaterialCard
