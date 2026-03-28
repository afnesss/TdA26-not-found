import type {
  FileMaterialCreateRequest,
  MaterialInteractionAction,
  FileMaterialUpdateRequest,
  Material,
  UrlMaterialCreateRequest,
  UrlMaterialUpdateRequest,
} from '@/lib/schemas'
import { buildOrgApiPrefix } from '@/lib/routes'
import apiFetch from '../client'

type MaterialBody = FileMaterialUpdateRequest | UrlMaterialUpdateRequest

const buildMaterialApiPath = (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
  suffix: string = '',
) =>
  `${buildOrgApiPrefix(orgSlug)}/courses/${courseId}/modules/${moduleId}/materials${suffix}`

export const getMaterials = async (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
): Promise<Material[]> => {
  return await apiFetch<Material[]>(buildMaterialApiPath(courseId, moduleId, orgSlug))
}

export const updateMaterial = async (
  courseId: string,
  moduleId: string,
  materialId: string,
  body: MaterialBody,
  orgSlug?: string,
): Promise<Material> => {
  if ('file' in body && body.file) {
    const formData = new FormData()
    if (body.name) formData.append('name', body.name)
    if (body.description) formData.append('description', body.description)
    formData.append('file', body.file)

    return await apiFetch<Material>(
      buildMaterialApiPath(courseId, moduleId, orgSlug, `/${materialId}`),
      {
        method: 'PUT',
        body: formData,
      },
    )
  }

  return await apiFetch<Material>(
    buildMaterialApiPath(courseId, moduleId, orgSlug, `/${materialId}`),
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
  orgSlug?: string,
): Promise<void> => {
  return await apiFetch<void>(
    buildMaterialApiPath(courseId, moduleId, orgSlug, `/${materialId}`),
    {
      method: 'DELETE',
    },
  )
}

export const createMaterial = async (
  courseId: string,
  moduleId: string,
  body: FileMaterialCreateRequest | UrlMaterialCreateRequest,
  orgSlug?: string,
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
      buildMaterialApiPath(courseId, moduleId, orgSlug),
      {
        method: 'POST',
        body: formData,
      },
    )
  }

  return await apiFetch<Material>(
    buildMaterialApiPath(courseId, moduleId, orgSlug),
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
  orgSlug?: string,
): Promise<Material> => {
  return await apiFetch<Material>(
    buildMaterialApiPath(courseId, moduleId, orgSlug, `/${materialId}/interactions`),
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
  orgSlug?: string,
): string => {
  return `/api${buildMaterialApiPath(courseId, moduleId, orgSlug, `/${materialId}/download`)}`
}
