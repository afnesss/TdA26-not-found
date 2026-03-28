import type { ApiError } from '@/lib/types'
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
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CourseDetail, CourseStatus, CourseSummary } from '@/lib/schemas'

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
      await queryClient.cancelQueries({ queryKey: ['courses'] })
      await queryClient.cancelQueries({ queryKey: ['courses-user'] })

      const previousCourses = queryClient.getQueryData<CourseSummary[]>([
        'courses',
      ])
      const previousCoursesUser = queryClient.getQueryData<CourseSummary[]>([
        'courses-user',
      ])

      queryClient.setQueryData<CourseSummary[]>(['courses'], (oldCourses) => {
        if (!oldCourses) return oldCourses
        return oldCourses.filter((course) => course.uuid !== courseId)
      })

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
      toast.success('Kurz smazán')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při mazání kurzu',
        queryClient,
        ['courses'],
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
      pendingCloneIds.delete(context?.tempId ?? '')

      queryClient.setQueryData<CourseSummary[]>(['courses'], (old = []) => {
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
      })

      if (!options?.skipInvalidateCourses) {
        queryClient.invalidateQueries({ queryKey: ['courses'] })
      }

      if (options?.toastMessage) {
        toast.success(options.toastMessage(variables.source))
      }

      options?.onSuccess?.(clonedCourse, variables.source)
    },
    onMutate: async ({ source }) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] })

      const previousCourses = queryClient.getQueryData<CourseSummary[]>([
        'courses',
      ])
      const tempId = `temp-clone-${Date.now()}`

      const optimistic: CourseSummary = {
        uuid: tempId,
        name: `${source.name}`,
        description: source.description ?? '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<CourseSummary[]>(['courses'], (old = []) => {
        if (options?.optimisticInsert) {
          return options.optimisticInsert(old, optimistic)
        }
        return [optimistic, ...old]
      })
      pendingCloneIds.add(tempId)

      return { previousCourses, tempId }
    },
    onError: (error: ApiError, _variables, context) => {
      if (context?.tempId) pendingCloneIds.delete(context.tempId)
      onErrorWithRollback(
        error,
        'Chyba při kopírování kurzu',
        queryClient,
        ['courses'],
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
      const result = await updateCourse(courseId, data, orgSlug)
      if (!result) {
        throw new Error('Update course returned null')
      }
      return result
    },
    networkMode: 'always',
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] })
      await queryClient.cancelQueries({ queryKey: ['course', courseId] })

      const previousCourses = queryClient.getQueryData<CourseSummary[]>([
        'courses',
      ])
      const previousCourse = queryClient.getQueryData<CourseDetail>([
        'course',
        courseId,
      ])

      queryClient.setQueryData<CourseSummary[]>(['courses'], (oldCourses) => {
        if (!oldCourses) return oldCourses
        return oldCourses.map((course) =>
          course.uuid === courseId
            ? { ...course, name: data.name, description: data.description }
            : course,
        )
      })

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

      toast.success('Kurz aktualizován')

      // Zavolat callback pro reset formy
      if (onSuccessCallback) {
        onSuccessCallback(updatedCourse)
      }
    },
    onError: (error: ApiError, _variables, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses)
      }
      if (context?.previousCourse) {
        queryClient.setQueryData(['course', courseId], context.previousCourse)
      }
      onError(error, 'Chyba při aktualizaci kurzu')
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
      const result = await createCourse(data, orgSlug)
      if (!result) {
        throw new Error('Create course returned null')
      }
      return result
    },
    networkMode: 'always',
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] })

      const previousCourses = queryClient.getQueryData<CourseSummary[]>([
        'courses',
      ])

      const optimisticCourse: CourseSummary = {
        uuid: 'temp-' + Date.now(),
        name: data.name,
        description: data.description,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<CourseSummary[]>(['courses'], (oldCourses) => {
        if (!oldCourses) return oldCourses
        return [...oldCourses, optimisticCourse]
      })

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
      toast.success('Kurz vytvořen')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při vytváření kurzu',
        queryClient,
        ['courses'],
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
    mutationFn: ({ status }) => updateCourse(courseId, { status }, orgSlug),
    onSuccess: async () => {
      await invalidateCourseQueries(queryClient, courseId)
    },
    onError: () => {
      toast.error('Chyba při změně stavu')
    },
  })
}

export const useImportCourseMutation = (options?: {
  onSuccess?: (courses: CourseSummary[]) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation<
    CourseSummary[],
    ApiError,
    { file: File }
  >({
    mutationFn: (input) => importCourseBackup(input),
    networkMode: 'always',
    onSuccess: async (courses) => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      toast.success('Kurz importován')
      options?.onSuccess?.(courses)
    },
    onError: (error) => {
      onError(error, 'Chyba při importu kurzu')
    },
  })
}

export const useImportAllCoursesMutation = (options?: {
  onSuccess?: (courses: CourseSummary[]) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation<CourseSummary[], ApiError, { file: File }>({
    mutationFn: (input) => importAllCoursesBackup(input),
    networkMode: 'always',
    onSuccess: async (courses) => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      toast.success(
        courses.length === 1
          ? '1 kurz importován'
          : `${courses.length} kurzů importováno`,
      )
      options?.onSuccess?.(courses)
    },
    onError: (error) => {
      onError(error, 'Chyba při importu kurzů')
    },
  })
}
