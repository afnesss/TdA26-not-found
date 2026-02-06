import {
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from '@/api/queries/materialQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Material } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { onError } from './helperFunctions'

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB

const validateFileSize = (file?: File): void => {
  if (file && file.size > MAX_FILE_SIZE) {
    throw {
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'Soubor je příliš velký (max 30MB)' },
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
    networkMode: 'always',
    onSuccess: (updatedMaterial) => {
      // Update cache directly to preserve order
      queryClient.setQueryData<Material[]>(
        ['materials', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return oldData.map((m) =>
            m.uuid === updatedMaterial.uuid ? updatedMaterial : m,
          )
        },
      )
      toast.success('Materiál aktualizován')
    },
    onError: (error: ApiError) =>
      onError(error, 'Chyba při aktualizaci materiálu'),
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
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', courseId] })
      setDraftMaterial(null)
      toast.success('Materiál vytvořen')
    },
    onError: (error: ApiError) =>
      onError(error, 'Chyba při vytváření materiálu'),
  })
}

export const useDeleteMaterialMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string>({
    mutationFn: (materialId: string) => deleteMaterial(courseId, materialId),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['materials', courseId],
      })
      toast.success('Material smazán')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při mazání materialu'),
  })
}
