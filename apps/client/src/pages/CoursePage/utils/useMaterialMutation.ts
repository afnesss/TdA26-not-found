import {
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from '@/api/queries/materialQueries'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Material } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { onErrorWithRollback } from './helperFunctions'

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB

const getMaterialsQueryKey = (courseId: string, moduleId: string) => [
  'materials',
  courseId,
  moduleId,
]
const getDashboardModuleQueryKey = (courseId: string, moduleId: string) => [
  'course-module',
  courseId,
  moduleId,
]
const getDashboardModulesQueryKey = (courseId: string) => [
  'course-modules',
  courseId,
]
const getCourseQueryKey = (courseId: string) => ['course', courseId]

const validateFileSize = (file?: File): void => {
  if (file && file.size > MAX_FILE_SIZE) {
    throw {
      status: 400,
      statusText: 'Bad Request',
      body: { message: 'Soubor je příliš velký (max 30MB)' },
    }
  }
}

const invalidateQueries = (
  courseId: string,
  moduleId: string,
  queryClient: QueryClient,
) => {
  queryClient.invalidateQueries({
    queryKey: getDashboardModuleQueryKey(courseId, moduleId),
  })
  queryClient.invalidateQueries({
    queryKey: getDashboardModulesQueryKey(courseId),
  })
  queryClient.invalidateQueries({
    queryKey: getCourseQueryKey(courseId),
  })
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
export const useUpdateMutation = (courseId: string, moduleId: string) => {
  const queryClient = useQueryClient()
  const materialsQueryKey = getMaterialsQueryKey(courseId, moduleId)

  return useMutation<
    Material,
    ApiError,
    { materialId: string; data: MaterialDraft },
    { previousMaterials?: Material[] }
  >({
    mutationFn: ({
      materialId,
      data,
    }: {
      materialId: string
      data: MaterialDraft
    }) => {
      validateFileSize(data.file)
      return updateMaterial(courseId, moduleId, materialId, data)
    },
    networkMode: 'always',
    onMutate: async ({ materialId, data }) => {
      await queryClient.cancelQueries({ queryKey: materialsQueryKey })

      const previousMaterials =
        queryClient.getQueryData<Material[]>(materialsQueryKey)

      queryClient.setQueryData<Material[]>(
        materialsQueryKey,
        (oldMaterials) => {
          if (!oldMaterials) return oldMaterials
          return oldMaterials.map((m) =>
            m.uuid === materialId
              ? {
                  ...m,
                  name: data.name ?? m.name,
                  description: data.description ?? m.description,
                }
              : m,
          )
        },
      )

      return { previousMaterials }
    },
    onSuccess: (updatedMaterial) => {
      queryClient.setQueryData<Material[]>(materialsQueryKey, (oldData) => {
        if (!oldData) return oldData
        return oldData.map((m) =>
          m.uuid === updatedMaterial.uuid ? updatedMaterial : m,
        )
      })
      invalidateQueries(courseId, moduleId, queryClient)
      toast.success('Materiál aktualizován')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při aktualizaci materiálu',
        queryClient,
        materialsQueryKey,
        context?.previousMaterials,
      )
    },
  })
}

export const useCreateMutation = (
  courseId: string,
  moduleId: string,
  setDraftMaterial: (a: Material | null) => void,
) => {
  const queryClient = useQueryClient()
  const materialsQueryKey = getMaterialsQueryKey(courseId, moduleId)
  return useMutation<
    Material,
    ApiError,
    CreateMaterialPayload,
    { previousMaterials?: Material[] }
  >({
    mutationFn: (payload: CreateMaterialPayload) => {
      if (payload.type === 'file') {
        validateFileSize(payload.file)
      }
      return createMaterial(courseId, moduleId, payload)
    },
    networkMode: 'always',
    onMutate: async (data: CreateMaterialPayload) => {
      await queryClient.cancelQueries({ queryKey: materialsQueryKey })

      const previousMaterials =
        queryClient.getQueryData<Material[]>(materialsQueryKey)

      // Only optimistic update for URL type - safe because URL is immediately available
      if (data.type === 'url') {
        const optimisticMaterial: Material = {
          uuid: 'temp-' + Date.now(),
          name: data.name,
          description: data.description,
          type: 'url',
          url: data.url,
        }

        queryClient.setQueryData<Material[]>(
          materialsQueryKey,
          (oldMaterials) => {
            if (!oldMaterials) return oldMaterials
            return [...oldMaterials, optimisticMaterial]
          },
        )
      }
      // For files, no optimistic update - wait for server response

      return { previousMaterials }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsQueryKey })
      setDraftMaterial(null)
      invalidateQueries(courseId, moduleId, queryClient)
      toast.success('Materiál vytvořen')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        error.body?.message || 'Chyba při vytváření materiálu',
        queryClient,
        materialsQueryKey,
        context?.previousMaterials,
      )
    },
  })
}

export const useDeleteMaterialMutation = (
  courseId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()
  const materialsQueryKey = getMaterialsQueryKey(courseId, moduleId)
  return useMutation<
    void,
    ApiError,
    string,
    { previousMaterials?: Material[] }
  >({
    mutationFn: (materialId: string) =>
      deleteMaterial(courseId, moduleId, materialId),
    networkMode: 'always',
    onMutate: async (materialId) => {
      await queryClient.cancelQueries({ queryKey: materialsQueryKey })

      const previousMaterials =
        queryClient.getQueryData<Material[]>(materialsQueryKey)
      queryClient.setQueryData<Material[]>(
        materialsQueryKey,
        (oldMaterials) => {
          if (!oldMaterials) return oldMaterials
          return oldMaterials.filter((m) => m.uuid !== materialId)
        },
      )

      return { previousMaterials }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueryKey,
      })
      invalidateQueries(courseId, moduleId, queryClient)
      toast.success('Materiál smazán')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při mazání materiálu',
        queryClient,
        materialsQueryKey,
        context?.previousMaterials,
      )
    },
  })
}
