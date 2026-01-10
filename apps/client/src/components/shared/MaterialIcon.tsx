import type { Material } from '@/lib/schemas'
import { cn, getFileIcon } from '@/lib/utils'

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

export default MaterialIcon
