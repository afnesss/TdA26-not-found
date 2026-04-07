import { exportAllCourses } from '@/api/queries/courseQueries'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CourseBackupSchema,
  type CourseSummary,
  CoursesBackupCollectionSchema,
} from '@/lib/schemas/course'
import { cn } from '@/lib/utils'
import { useImportCourseMutation } from '@/pages/CoursePage/utils/useCourseMutation'
import { useQueryClient } from '@tanstack/react-query'
import { Download, FolderInput, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { buildOrgDashboardCoursePath } from '@/lib/routes'

type CourseBackupActionsDropdownProps = {
  className?: string
  triggerLabel?: string
  triggerAriaLabel?: string
  menuLabel?: string
  exportLabel?: string
  importLabel?: string
  invalidJsonMessage?: string
  duplicateCourseMessage?: (courseId: string) => string
  exportSuccessMessage?: string
  exportErrorMessage?: string
}

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

const getBackupCourseIds = (input: unknown): string[] => {
  const collectionResult = CoursesBackupCollectionSchema.safeParse(input)
  if (collectionResult.success) {
    return collectionResult.data.courses.map((course) => course.course.uuid)
  }

  const singleResult = CourseBackupSchema.safeParse(input)
  if (singleResult.success) {
    return [singleResult.data.course.uuid]
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    'course' in input &&
    typeof input.course === 'object' &&
    input.course !== null &&
    'uuid' in input.course &&
    typeof input.course.uuid === 'string'
  ) {
    return [input.course.uuid]
  }

  return []
}

const CourseBackupActionsDropdown = ({
  className,
  triggerLabel,
  triggerAriaLabel = 'Zálohy kurzů',
  menuLabel = 'Export a import',
  exportLabel = 'Exportovat vše',
  importLabel = 'Importovat kurzy',
  invalidJsonMessage = 'Vyber JSON zálohu',
  duplicateCourseMessage = (courseId: string) =>
    `Kurz s ID ${courseId} už existuje`,
  exportSuccessMessage = 'Všechny kurzy byly exportovány',
  exportErrorMessage = 'Nepodařilo se exportovat všechny kurzy',
}: CourseBackupActionsDropdownProps) => {
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const { mutateAsync: importCourses, isPending: importing } =
    useImportCourseMutation({
      onSuccess: (courses) => {
        if (courses.length === 1) {
          navigate(buildOrgDashboardCoursePath(orgSlug, courses[0].uuid))
        }
      },
    }, orgSlug)
  const isBusy = importing

  const runImport = async (file: File) => {
    try {
      await importCourses({ file })
    } catch {
      return
    }
  }

  const handleJsonFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error(invalidJsonMessage)
      return
    }

    try {
      const parsed = JSON.parse(await file.text())
      const existingCourses =
        queryClient.getQueryData<CourseSummary[]>(['courses']) ?? []
      const existingCourseIds = new Set(existingCourses.map((course) => course.uuid))
      const duplicateCourseId = getBackupCourseIds(parsed).find((courseId) =>
        existingCourseIds.has(courseId),
      )

      if (duplicateCourseId) {
        toast.error(duplicateCourseMessage(duplicateCourseId))
        return
      }
    } catch {
      // Let the server validate unsupported or legacy backup variants.
    }

    await runImport(file)
  }

  return (
    <>
      <input
        ref={importInputRef}
        type='file'
        accept='application/json,.json'
        className='hidden'
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          await handleJsonFile(file)
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className={cn('rounded-xl px-2', className)}
            disabled={isBusy}
            aria-label={triggerAriaLabel}
          >
            <FolderInput className='h-4 w-4 text-primary' aria-hidden='true' />
            {triggerLabel && <span>{triggerLabel}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56 rounded-xl'>
          <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='gap-2 cursor-pointer'
            disabled={isBusy}
            onSelect={() => {
              void (async () => {
                try {
                  const blob = await exportAllCourses(orgSlug)
                  downloadBlob(blob, 'all-courses-backup.json')
                  toast.success(exportSuccessMessage)
                } catch {
                  toast.error(exportErrorMessage)
                }
              })()
            }}
          >
            <Download className='h-4 w-4 text-gray-400' />
            <span>{exportLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='gap-2 cursor-pointer'
            disabled={isBusy}
            onSelect={() => importInputRef.current?.click()}
          >
            <Upload className='h-4 w-4 text-gray-400' />
            <span>{importLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default CourseBackupActionsDropdown
