import type {
  FileMaterialCreateRequest,
  MaterialInteractionAction,
  FileMaterialUpdateRequest,
  Material,
  UrlMaterialCreateRequest,
  UrlMaterialUpdateRequest,
} from '@/lib/schemas'
import apiFetch from '../client'

type MaterialBody = FileMaterialUpdateRequest | UrlMaterialUpdateRequest

export const getMaterials = async (
  courseId: string,
  moduleId: string,
): Promise<Material[]> => {
  return await apiFetch<Material[]>(
    `/courses/${courseId}/modules/${moduleId}/materials`,
  )
}

export const updateMaterial = async (
  courseId: string,
  moduleId: string,
  materialId: string,
  body: MaterialBody,
): Promise<Material> => {
  if ('file' in body && body.file) {
    const formData = new FormData()
    if (body.name) formData.append('name', body.name)
    if (body.description) formData.append('description', body.description)
    formData.append('file', body.file)

    return await apiFetch<Material>(
      `/courses/${courseId}/modules/${moduleId}/materials/${materialId}`,
      {
        method: 'PUT',
        body: formData,
      },
    )
  }

  return await apiFetch<Material>(
    `/courses/${courseId}/modules/${moduleId}/materials/${materialId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export const deleteMaterial = async (
  courseId: string,
  moduleId: string,
  materialId: string,
): Promise<void> => {
  return await apiFetch<void>(
    `/courses/${courseId}/modules/${moduleId}/materials/${materialId}`,
    {
      method: 'DELETE',
    },
  )
}

export const createMaterial = async (
  courseId: string,
  moduleId: string,
  body: FileMaterialCreateRequest | UrlMaterialCreateRequest,
): Promise<Material> => {
  if (body.type === 'file') {
    const formData = new FormData()

    formData.append('type', 'file')
    formData.append('name', body.name)

    if (body.description) {
      formData.append('description', body.description)
    }
    formData.append('file', body.file)

    return await apiFetch<Material>(
      `/courses/${courseId}/modules/${moduleId}/materials`,
      {
        method: 'POST',
        body: formData,
      },
    )
  }

  return await apiFetch<Material>(
    `/courses/${courseId}/modules/${moduleId}/materials`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export const trackMaterialInteraction = async (
  courseId: string,
  moduleId: string,
  materialId: string,
  action: MaterialInteractionAction,
): Promise<Material> => {
  return await apiFetch<Material>(
    `/courses/${courseId}/modules/${moduleId}/materials/${materialId}/interactions`,
    {
      method: 'POST',
      body: JSON.stringify({ action }),
    },
  )
}

export const getMaterialDownloadUrl = (
  courseId: string,
  moduleId: string,
  materialId: string,
): string => {
  return `/api/courses/${courseId}/modules/${moduleId}/materials/${materialId}/download`
}
