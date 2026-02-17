import type { ApiError } from '@/lib/types'
import { onError, onErrorWithRollback } from './helperFunctions'
import {
  cloneCourse,
  createCourse,
  deleteCourse,
  updateCourse,
} from '@/api/queries/courseQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CourseDetail, CourseSummary } from '@/lib/schemas'

export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<
    void,
    ApiError,
    string,
    { previousCourses?: CourseSummary[]; previousCoursesUser?: CourseSummary[] }
  >({
    mutationFn: async (courseId: string) => await deleteCourse(courseId),
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

export const useCloneCourseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CourseSummary,
    ApiError,
    { source: CourseSummary },
    { previousCourses?: CourseSummary[]; tempId: string }
  >({
    mutationFn: async ({ source }) => {
      const result = await cloneCourse(source.uuid)
      if (!result) {
        throw new Error('Clone course returned null')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Kurz byl zkopirován')
    },
    onMutate: async ({ source }) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] })

      const previousCourses = queryClient.getQueryData<CourseSummary[]>([
        'courses',
      ])
      const tempId = `temp-clone-${Date.now()}`

      const optimistic: CourseSummary = {
        uuid: tempId,
        name: `${source.name} (kopie)`,
        description: source.description ?? '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData<CourseSummary[]>(['courses'], (old = []) => [
        optimistic,
        ...old,
      ])

      return { previousCourses, tempId }
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při kopirování kurzu',
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
) => {
  const queryClient = useQueryClient()
  return useMutation<
    CourseSummary,
    ApiError,
    { name: string; description?: string },
    { previousCourses?: CourseSummary[]; previousCourse?: CourseDetail }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await updateCourse(courseId, data)
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

      toast.success('Kurz aktualizovan')

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
) => {
  const queryClient = useQueryClient()
  return useMutation<
    CourseSummary,
    ApiError,
    { name: string; description?: string },
    { previousCourses?: CourseSummary[] }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await createCourse(data)
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
