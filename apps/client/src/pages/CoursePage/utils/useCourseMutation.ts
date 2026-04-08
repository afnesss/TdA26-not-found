import type { ApiError } from '@/lib/types'
import i18n from '@/i18n'
import { onError, onErrorWithRollback } from './helperFunctions'
import {
  cloneCourse,
  createCourse,
  deleteCourse,
  importAllCoursesBackup,
  importCourseBackup,
  updateCourse,
} from '@/api/queries/courseQueries'
import { pendingCloneIds } from '@/api/pendingCloneIds'
import { getStoredUiLocale } from '@/lib/i18n'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CourseDetail, CourseStatus, CourseSummary } from '@/lib/schemas'

const getDashboardCoursesQueryKey = (locale = getStoredUiLocale()) =>
  ['courses', locale] as const

export const invalidateCourseQueries = async (
  queryClient: QueryClient,
  courseId: string,
) => {
  await queryClient.invalidateQueries({ queryKey: ['course', courseId] })
  await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
  await queryClient.invalidateQueries({ queryKey: ['courses'] })
}

export const useDeleteCourseMutation = (orgSlug?: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    void,
    ApiError,
    string,
    { previousCourses?: CourseSummary[]; previousCoursesUser?: CourseSummary[] }
  >({
    mutationFn: async (courseId: string) => await deleteCourse(courseId, orgSlug),
    networkMode: 'always',
    onMutate: async (courseId) => {
      const dashboardCoursesQueryKey = getDashboardCoursesQueryKey()
      await queryClient.cancelQueries({ queryKey: dashboardCoursesQueryKey })
      await queryClient.cancelQueries({ queryKey: ['courses-user'] })

      const previousCourses =
        queryClient.getQueryData<CourseSummary[]>(dashboardCoursesQueryKey)
      const previousCoursesUser = queryClient.getQueryData<CourseSummary[]>([
        'courses-user',
      ])

      queryClient.setQueryData<CourseSummary[]>(
        dashboardCoursesQueryKey,
        (oldCourses) => {
          if (!oldCourses) return oldCourses
          return oldCourses.filter((course) => course.uuid !== courseId)
        },
      )

      queryClient.setQueryData<CourseSummary[]>(
        ['courses-user'],
        (oldCourses) => {
          if (!oldCourses) return oldCourses
          return oldCourses.filter((course) => course.uuid !== courseId)
        },
      )

      return { previousCourses, previousCoursesUser }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      toast.success(i18n.t('toasts.course.deleted', { ns: 'dashboard' }))
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        i18n.t('toasts.course.deleteError', { ns: 'dashboard' }),
        queryClient,
        getDashboardCoursesQueryKey(),
        context?.previousCourses,
      )
    },
  })
}

export const useCloneCourseMutation = (options?: {
  onSuccess?: (cloned: CourseSummary, source: CourseSummary) => void
  toastMessage?: (source: CourseSummary) => string
  skipInvalidateCourses?: boolean
  skipOptimisticInsert?: boolean
  optimisticInsert?: (
    previous: CourseSummary[] | undefined,
    optimistic: CourseSummary,
  ) => CourseSummary[]
}, orgSlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    CourseSummary,
    ApiError,
    { source: CourseSummary },
    { previousCourses?: CourseSummary[]; tempId: string }
  >({
    mutationFn: async ({ source }) => {
      const result = await cloneCourse(source.uuid, orgSlug)
      if (!result) {
        throw new Error('Clone course returned null')
      }
      return result
    },
    onSuccess: (clonedCourse, variables, context) => {
      const dashboardCoursesQueryKey = getDashboardCoursesQueryKey()
      pendingCloneIds.delete(context?.tempId ?? '')

      queryClient.setQueryData<CourseSummary[]>(
        dashboardCoursesQueryKey,
        (old = []) => {
          if (!old) return old

          const realExists = old.some((c) => c.uuid === clonedCourse.uuid)
          if (realExists) {
            return old.map((c) =>
              c.uuid === clonedCourse.uuid ? clonedCourse : c,
            )
          }

          if (context?.tempId) {
            const tempExists = old.some((c) => c.uuid === context.tempId)
            if (tempExists) {
              return old.map((c) =>
                c.uuid === context.tempId ? clonedCourse : c,
              )
            }
          }

          if (options?.optimisticInsert) {
            return options.optimisticInsert(old, clonedCourse)
          }

          return [clonedCourse, ...old]
        },
      )

      if (!options?.skipInvalidateCourses) {
        queryClient.invalidateQueries({ queryKey: ['courses'] })
      }

      if (options?.toastMessage) {
        toast.success(options.toastMessage(variables.source))
      }

      options?.onSuccess?.(clonedCourse, variables.source)
    },
    onMutate: async ({ source }) => {
      const dashboardCoursesQueryKey = getDashboardCoursesQueryKey()
      await queryClient.cancelQueries({ queryKey: dashboardCoursesQueryKey })

      const previousCourses =
        queryClient.getQueryData<CourseSummary[]>(dashboardCoursesQueryKey)
      const tempId = `temp-clone-${Date.now()}`

      const optimistic: CourseSummary = {
        uuid: tempId,
        name: `${source.name}`,
        description: source.description ?? '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<CourseSummary[]>(
        dashboardCoursesQueryKey,
        (old = []) => {
          if (options?.optimisticInsert) {
            return options.optimisticInsert(old, optimistic)
          }
          return [optimistic, ...old]
        },
      )
      pendingCloneIds.add(tempId)

      return { previousCourses, tempId }
    },
    onError: (error: ApiError, _variables, context) => {
      if (context?.tempId) pendingCloneIds.delete(context.tempId)
      onErrorWithRollback(
        error,
        i18n.t('toasts.course.copyError', { ns: 'dashboard' }),
        queryClient,
        getDashboardCoursesQueryKey(),
        context?.previousCourses,
      )
    },
  })
}
export const useUpdateCourseMutation = (
  courseId: string,
  onSuccessCallback?: (updatedCourse: CourseSummary) => void,
  orgSlug?: string,
) => {
  const queryClient = useQueryClient()
  return useMutation<
    CourseSummary,
    ApiError,
    { name: string; description?: string },
    { previousCourses?: CourseSummary[]; previousCourse?: CourseDetail }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await updateCourse(
        courseId,
        {
          ...data,
          sourceLocale: getStoredUiLocale(),
        },
        orgSlug,
      )
      if (!result) {
        throw new Error('Update course returned null')
      }
      return result
    },
    networkMode: 'always',
    onMutate: async (data) => {
      const dashboardCoursesQueryKey = getDashboardCoursesQueryKey()
      await queryClient.cancelQueries({ queryKey: dashboardCoursesQueryKey })
      await queryClient.cancelQueries({ queryKey: ['course', courseId] })

      const previousCourses =
        queryClient.getQueryData<CourseSummary[]>(dashboardCoursesQueryKey)
      const previousCourse = queryClient.getQueryData<CourseDetail>([
        'course',
        courseId,
      ])

      queryClient.setQueryData<CourseSummary[]>(
        dashboardCoursesQueryKey,
        (oldCourses) => {
          if (!oldCourses) return oldCourses
          return oldCourses.map((course) =>
            course.uuid === courseId
              ? { ...course, name: data.name, description: data.description }
              : course,
          )
        },
      )

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldCourse) => {
          if (!oldCourse) return oldCourse
          return {
            ...oldCourse,
            name: data.name,
            description: data.description,
          }
        },
      )

      return { previousCourses, previousCourse }
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      queryClient.invalidateQueries({
        queryKey: ['course', courseId],
      })

      toast.success(i18n.t('toasts.course.updated', { ns: 'dashboard' }))

      // Zavolat callback pro reset formy
      if (onSuccessCallback) {
        onSuccessCallback(updatedCourse)
      }
    },
    onError: (error: ApiError, _variables, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(
          getDashboardCoursesQueryKey(),
          context.previousCourses,
        )
      }
      if (context?.previousCourse) {
        queryClient.setQueryData(['course', courseId], context.previousCourse)
      }
      onError(error, i18n.t('toasts.course.updateError', { ns: 'dashboard' }))
    },
  })
}

export const useCreateCourseMutation = (
  setDraftCourse: (a: CourseSummary | null) => void,
  orgSlug?: string,
) => {
  const queryClient = useQueryClient()
  return useMutation<
    CourseSummary,
    ApiError,
    { name: string; description?: string },
    { previousCourses?: CourseSummary[] }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await createCourse(
        {
          ...data,
          sourceLocale: getStoredUiLocale(),
        },
        orgSlug,
      )
      if (!result) {
        throw new Error('Create course returned null')
      }
      return result
    },
    networkMode: 'always',
    onMutate: async (data) => {
      const dashboardCoursesQueryKey = getDashboardCoursesQueryKey()
      await queryClient.cancelQueries({ queryKey: dashboardCoursesQueryKey })

      const previousCourses =
        queryClient.getQueryData<CourseSummary[]>(dashboardCoursesQueryKey)

      const optimisticCourse: CourseSummary = {
        uuid: 'temp-' + Date.now(),
        name: data.name,
        description: data.description,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<CourseSummary[]>(
        dashboardCoursesQueryKey,
        (oldCourses) => {
          if (!oldCourses) return oldCourses
          return [...oldCourses, optimisticCourse]
        },
      )

      return { previousCourses }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      })
      queryClient.invalidateQueries({
        queryKey: ['courses-user'],
      })
      setDraftCourse(null)
      toast.success(i18n.t('toasts.course.created', { ns: 'dashboard' }))
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        i18n.t('toasts.course.createError', { ns: 'dashboard' }),
        queryClient,
        getDashboardCoursesQueryKey(),
        context?.previousCourses,
      )
    },
  })
}

export const useUpdateCourseStatusMutation = (
  courseId: string,
  orgSlug?: string,
) => {
  const queryClient = useQueryClient()
  return useMutation<CourseSummary, ApiError, { status: CourseStatus }>({
    mutationFn: ({ status }) =>
      updateCourse(
        courseId,
        { status, sourceLocale: getStoredUiLocale() },
        orgSlug,
      ),
    onSuccess: async () => {
      await invalidateCourseQueries(queryClient, courseId)
    },
    onError: () => {
      toast.error(i18n.t('toasts.course.statusChangeError', { ns: 'dashboard' }))
    },
  })
}

export const useImportCourseMutation = (options?: {
  onSuccess?: (courses: CourseSummary[]) => void
}, orgSlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    CourseSummary[],
    ApiError,
    { file: File }
  >({
    mutationFn: (input) => importCourseBackup({ ...input, orgSlug }),
    networkMode: 'always',
    onSuccess: async (courses) => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      toast.success(i18n.t('toasts.course.imported', { ns: 'dashboard' }))
      options?.onSuccess?.(courses)
    },
    onError: (error) => {
      onError(error, i18n.t('toasts.course.importError', { ns: 'dashboard' }))
    },
  })
}

export const useImportAllCoursesMutation = (options?: {
  onSuccess?: (courses: CourseSummary[]) => void
}, orgSlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<CourseSummary[], ApiError, { file: File }>({
    mutationFn: (input) => importAllCoursesBackup({ ...input, orgSlug }),
    networkMode: 'always',
    onSuccess: async (courses) => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      toast.success(
        i18n.t('toasts.course.importedMany', {
          ns: 'dashboard',
          count: courses.length,
        }),
      )
      options?.onSuccess?.(courses)
    },
    onError: (error) => {
      onError(error, i18n.t('toasts.course.importManyError', { ns: 'dashboard' }))
    },
  })
}
