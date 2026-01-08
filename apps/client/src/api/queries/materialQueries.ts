import type {
  FileMaterialCreateRequest,
  FileMaterialUpdateRequest,
  Material,
  UrlMaterialCreateRequest,
  UrlMaterialUpdateRequest,
} from '@/lib/schemas'
import apiFetch from '../client'

type MaterialBody = FileMaterialUpdateRequest | UrlMaterialUpdateRequest

export const getMaterials = async (courseId: string): Promise<Material[]> => {
  return await apiFetch<Material[]>(`/courses/${courseId}/materials`)
}

export const updateMaterial = async (
  courseId: string,
  materialId: string,
  body: MaterialBody,
): Promise<Material> => {
  if ('file' in body && body.file) {
    const formData = new FormData()
    if (body.name) formData.append('name', body.name)
    if (body.description) formData.append('description', body.description)
    formData.append('file', body.file)

    return await apiFetch<Material>(
      `/courses/${courseId}/materials/${materialId}`,
      {
        method: 'PUT',
        body: formData,
      },
    )
  }

  return await apiFetch<Material>(
    `/courses/${courseId}/materials/${materialId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export const deleteMaterial = async (
  courseId: string,
  materialId: string,
): Promise<void> => {
  return await apiFetch<void>(`/courses/${courseId}/materials/${materialId}`, {
    method: 'DELETE',
  })
}

export const createMaterial = async (
  courseId: string,
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

    return await apiFetch<Material>(`/courses/${courseId}/materials`, {
      method: 'POST',
      body: formData,
    })
  }

  return await apiFetch<Material>(`/courses/${courseId}/materials`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
