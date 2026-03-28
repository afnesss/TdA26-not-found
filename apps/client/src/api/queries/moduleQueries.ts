import type {
  ModuleCreateRequest,
  ModuleDetail,
  ModuleReorderRequest,
  ModuleSummary,
  ModuleUpdateRequest,
} from '@/lib/schemas/module'
import apiFetch from '../client'

export const getCourseModules = async (
  courseId: string,
): Promise<ModuleSummary[]> => {
  return await apiFetch<ModuleSummary[]>(`/courses/${courseId}/modules`)
}

export const getModuleByUuid = async (
  courseId: string,
  moduleId: string,
): Promise<ModuleDetail> => {
  return await apiFetch<ModuleDetail>(
    `/courses/${courseId}/modules/${moduleId}`,
  )
}

export const updateModule = async (
  courseId: string,
  moduleId: string,
  body: ModuleUpdateRequest,
): Promise<ModuleSummary> => {
  return await apiFetch<ModuleSummary>(
    `/courses/${courseId}/modules/${moduleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export const createModule = async (
  courseId: string,
  body: ModuleCreateRequest,
) => {
  return await apiFetch<ModuleSummary>(`/courses/${courseId}/modules/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const deleteModule = async (
  courseId: string,
  moduleId: string,
): Promise<void> => {
  return await apiFetch<void>(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
  })
}

export const reorderModules = async (
  courseId: string,
  body: ModuleReorderRequest,
): Promise<ModuleSummary[]> => {
  return await apiFetch<ModuleSummary[]>(
    `/courses/${courseId}/modules/reorder`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}
