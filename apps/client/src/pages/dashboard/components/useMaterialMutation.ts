import { createMaterial, updateMaterial } from '@/api/queries/materialQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Material } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB

const validateFileSize = (file?: File): void => {
  if (file && file.size > MAX_FILE_SIZE) {
    throw {
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'File too large (max 30MB)' },
    }
  }
}

export type MaterialDraft = {
  name?: string
  description?: string
  type: 'file' | 'url'
  file?: File
  url?: string
}
export type CreateMaterialPayload =
  | {
      type: 'file'
      name: string
      file: File
      description?: string
    }
  | {
      type: 'url'
      name: string
      url: string
      description?: string
    }
export const useUpdateMutation = (courseId: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    Material,
    ApiError,
    { materialId: string; data: MaterialDraft }
  >({
    mutationFn: ({
      materialId,
      data,
    }: {
      materialId: string
      data: MaterialDraft
    }) => {
      validateFileSize(data.file)
      return updateMaterial(courseId, materialId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', courseId] })
      toast.success('Materiál aktualizován')
    },
    onError: (error: ApiError) => {
      console.error('Update error:', error)
      console.log('Error body:', error?.body)
      const errorMessage =
        error?.body?.message || 'Chyba při aktualizaci materiálu'
      toast.error(errorMessage)
    },
  })
}

export const useCreateMutation = (
  courseId: string,
  setDraftMaterial: (a: Material | null) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation<Material, ApiError, CreateMaterialPayload>({
    mutationFn: (payload: CreateMaterialPayload) => {
      if (payload.type === 'file') {
        validateFileSize(payload.file)
      }
      return createMaterial(courseId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', courseId] })
      setDraftMaterial(null)
      toast.success('Materiál vytvořen')
    },
    onError: (error: ApiError) => {
      console.error('Create error:', error)
      console.log('Error body:', error?.body)
      const errorMessage =
        error?.body?.message || 'Chyba při vytváření materiálu'
      toast.error(errorMessage)
    },
  })
}
