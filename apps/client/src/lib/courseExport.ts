import type { CourseDetail, CourseSummary, FeedItem, StatusHistoryEvent } from './schemas'
import type { CourseModule } from './schemas'

type ExportableCourseBase = Pick<
  CourseSummary,
  | 'uuid'
  | 'name'
  | 'description'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'startedAt'
  | 'scheduledFor'
>

export type CourseExportData = ExportableCourseBase & {
  modules?: CourseModule[]
  feed?: FeedItem[]
  status_history?: StatusHistoryEvent[]
}

const COURSE_EXPORT_CSV_HEADERS = [
  'courseUuid',
  'courseName',
  'courseStatus',
  'courseDescription',
  'createdAt',
  'updatedAt',
  'startedAt',
  'scheduledFor',
  'moduleUuid',
  'moduleName',
  'moduleStatus',
  'moduleDescription',
  'moduleCreatedAt',
  'moduleUpdatedAt',
] as const

const normalizeCourseExportData = (
  course: CourseDetail | CourseExportData,
): CourseExportData => ({
  uuid: course.uuid,
  name: course.name,
  description: course.description ?? null,
  status: course.status,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
  startedAt: course.startedAt ?? null,
  scheduledFor: course.scheduledFor ?? null,
  modules: course.modules ?? [],
  feed: 'feed' in course ? (course.feed ?? []) : [],
  status_history: course.status_history ?? [],
})

const serializeValue = (value: string | Date | null | undefined) =>
  value instanceof Date ? value.toISOString() : value ?? ''

const escapeCsvValue = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

const slugifyFilePart = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

export const buildCourseExportFilename = (
  courseName: string,
  extension: 'json' | 'csv',
) => {
  const safeCourseName = slugifyFilePart(courseName) || 'course'
  return `${safeCourseName}-export.${extension}`
}

export const buildCourseExportJson = (
  course: CourseDetail | CourseExportData,
) => {
  const normalizedCourse = normalizeCourseExportData(course)

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      course: normalizedCourse,
    },
    null,
    2,
  )
}

export const buildCourseExportCsv = (
  course: CourseDetail | CourseExportData,
) => {
  const normalizedCourse = normalizeCourseExportData(course)
  const modules = normalizedCourse.modules ?? []

  const rows =
    modules.length > 0
      ? modules.map((module) => [
          normalizedCourse.uuid,
          normalizedCourse.name,
          normalizedCourse.status,
          normalizedCourse.description ?? '',
          serializeValue(normalizedCourse.createdAt),
          serializeValue(normalizedCourse.updatedAt),
          serializeValue(normalizedCourse.startedAt),
          serializeValue(normalizedCourse.scheduledFor),
          module.uuid,
          module.name,
          module.status,
          module.description ?? '',
          serializeValue(module.createdAt),
          serializeValue(module.updatedAt),
        ])
      : [
          [
            normalizedCourse.uuid,
            normalizedCourse.name,
            normalizedCourse.status,
            normalizedCourse.description ?? '',
            serializeValue(normalizedCourse.createdAt),
            serializeValue(normalizedCourse.updatedAt),
            serializeValue(normalizedCourse.startedAt),
            serializeValue(normalizedCourse.scheduledFor),
            '',
            '',
            '',
            '',
            '',
            '',
          ],
        ]

  return [
    COURSE_EXPORT_CSV_HEADERS.join(','),
    ...rows.map((row) =>
      row.map((value) => escapeCsvValue(String(value))).join(','),
    ),
  ].join('\n')
}

export const downloadExportFile = ({
  content,
  fileName,
  mimeType,
}: {
  content: string
  fileName: string
  mimeType: string
}) => {
  const blob = new Blob([content], { type: mimeType })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
