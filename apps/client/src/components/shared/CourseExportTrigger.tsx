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
import { toast } from 'sonner'
import EditBtn from '@/pages/dashboard/components/EditBtn'

type CourseExportTriggerProps = {
  courseId: string
  courseName: string
  className?: string
  variant?: 'card' | 'detail'
  disabled?: boolean
  label?: string
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
}: CourseExportTriggerProps) => {
  const [isExporting, setIsExporting] = useState(false)

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
      const blob = await exportCourse(courseId, 'json')
      const safeCourseName = slugifyFilePart(courseName) || 'course'
      downloadBlob(blob, `${safeCourseName}-backup.json`)
      toast.success('Kurz byl exportovan do JSON zalohy')
    } catch {
      toast.error('Nepodarilo se exportovat kurz')
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
          aria-label='Export kurzu'
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
          <span>Exportovat zalohu JSON</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CourseExportTrigger
