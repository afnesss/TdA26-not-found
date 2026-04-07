import { exportCourse } from '@/api/queries/courseQueries'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Download, FileJson2 } from 'lucide-react'
import {
  useState,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { useParams } from 'react-router'

type CourseExportTriggerProps = {
  courseId: string
  courseName: string
  className?: string
  variant?: 'card' | 'detail'
  disabled?: boolean
  label?: string
  triggerAriaLabel?: string
  itemLabel?: string
  successMessage?: string
  errorMessage?: string
}

const slugifyFilePart = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

const CourseExportTrigger = ({
  courseId,
  courseName,
  className,
  variant = 'detail',
  disabled = false,
  label,
  triggerAriaLabel,
  itemLabel,
  successMessage,
  errorMessage,
}: CourseExportTriggerProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const { t } = useTranslation('dashboard')
  const resolvedTriggerAriaLabel =
    triggerAriaLabel ?? t('courseOverview.export.triggerAriaLabel')
  const resolvedItemLabel = itemLabel ?? t('courseOverview.export.itemLabel')
  const resolvedSuccessMessage =
    successMessage ?? t('courseOverview.export.success')
  const resolvedErrorMessage = errorMessage ?? t('courseOverview.export.error')

  const stopCardClick = (
    event?: Event | MouseEvent | PointerEvent | SyntheticEvent,
  ) => {
    if (variant === 'card' && event) {
      event.stopPropagation()
    }
  }

  const handleExport = async () => {
    if (isExporting || disabled) return

    setIsExporting(true)

    try {
      const blob = await exportCourse(courseId, 'json', orgSlug)
      const safeCourseName = slugifyFilePart(courseName) || 'course'
      downloadBlob(blob, `${safeCourseName}-backup.json`)
      toast.success(resolvedSuccessMessage)
    } catch {
      toast.error(resolvedErrorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EditBtn
          icon={Download}
          disabled={disabled || isExporting}
          classNameBtn={cn(className)}
          label={label}
          aria-label={resolvedTriggerAriaLabel}
          onPointerDown={(event) => stopCardClick(event)}
          onClick={(event) => stopCardClick(event)}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-48 rounded-xl'
        onPointerDown={(event) => stopCardClick(event)}
        onClick={(event) => stopCardClick(event)}
      >
        <DropdownMenuItem
          onPointerDown={(event) => stopCardClick(event)}
          onClick={(event) => stopCardClick(event)}
          onSelect={(event) => {
            stopCardClick(event)
            void handleExport()
          }}
          disabled={disabled || isExporting}
          className='gap-2 cursor-pointer text-xs sm:text-sm'
        >
          <FileJson2 className='h-4 w-4 text-gray-400' />
          <span>{resolvedItemLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CourseExportTrigger
