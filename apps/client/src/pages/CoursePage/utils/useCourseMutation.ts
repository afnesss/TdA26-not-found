import type { ApiError } from '@/lib/types'
import { onError } from './helperFunctions'
import {
  createCourse,
  deleteCourse,
  updateCourse,
} from '@/api/queries/courseQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CourseDetail, CourseSummary } from '@/lib/schemas'

export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string>({
    mutationFn: async (courseId: string) => await deleteCourse(courseId),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Kurz smazán')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při mazání kurzu'),
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
    { name: string; description?: string }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await updateCourse(courseId, data)
      if (!result) {
        throw new Error('Update course returned null')
      }
      return result
    },
    networkMode: 'always',
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({
        queryKey: ['course', courseId],
      })

      toast.success('Kurz aktualizovan')

      // Zavolat callback pro reset formy
      if (onSuccessCallback) {
        onSuccessCallback(updatedCourse)
      }
    },
    onError: (error: ApiError) => {
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
    { name: string; description?: string }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const result = await createCourse(data)
      if (!result) {
        throw new Error('Create course returned null')
      }
      return result
    },
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      })
      setDraftCourse(null)
      toast.success('Kurz vytvořen')
    },
    onError: (error: ApiError) => {
      onError(error, 'Chyba při vytváření kurzu')
    },
  })
}
