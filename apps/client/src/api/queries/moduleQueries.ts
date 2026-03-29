import type {
  ModuleCreateRequest,
  ModuleDetail,
  ModuleReorderRequest,
  ModuleSummary,
  ModuleUpdateRequest,
} from '@/lib/schemas/module'
import { buildOrgApiPrefix } from '@/lib/routes'
import apiFetch from '../client'

const buildModuleApiPath = (
  courseId: string,
  orgSlug?: string,
  suffix: string = '',
) => `${buildOrgApiPrefix(orgSlug)}/courses/${courseId}/modules${suffix}`

export const getCourseModules = async (
  courseId: string,
  orgSlug?: string,
): Promise<ModuleSummary[]> => {
  return await apiFetch<ModuleSummary[]>(buildModuleApiPath(courseId, orgSlug))
}

export const getModuleByUuid = async (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
): Promise<ModuleDetail> => {
  return await apiFetch<ModuleDetail>(buildModuleApiPath(courseId, orgSlug, `/${moduleId}`))
}

export const updateModule = async (
  courseId: string,
  moduleId: string,
  body: ModuleUpdateRequest,
  orgSlug?: string,
): Promise<ModuleSummary> => {
  return await apiFetch<ModuleSummary>(buildModuleApiPath(courseId, orgSlug, `/${moduleId}`), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const createModule = async (
  courseId: string,
  body: ModuleCreateRequest,
  orgSlug?: string,
) => {
  return await apiFetch<ModuleSummary>(buildModuleApiPath(courseId, orgSlug, '/'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const deleteModule = async (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
): Promise<void> => {
  return await apiFetch<void>(buildModuleApiPath(courseId, orgSlug, `/${moduleId}`), {
    method: 'DELETE',
  })
}

export const reorderModules = async (
  courseId: string,
  body: ModuleReorderRequest,
  orgSlug?: string,
): Promise<ModuleSummary[]> => {
  return await apiFetch<ModuleSummary[]>(buildModuleApiPath(courseId, orgSlug, '/reorder'), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
