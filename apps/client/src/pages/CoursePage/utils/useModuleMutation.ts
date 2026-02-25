import {
  createModule,
  deleteModule,
  reorderModules,
  updateModule,
} from '@/api/queries/moduleQueries'
import type { CourseDetail } from '@/lib/schemas'
import type {
  ModuleCreateRequest,
  ModuleDetail,
  ModuleReorderRequest,
  ModuleSummary,
  ModuleUpdateRequest,
} from '@/lib/schemas/module'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onErrorWithRollback } from './helperFunctions'

const getCourseQueryKey = (courseId: string) => ['course', courseId]
const getCourseModulesQueryKey = (courseId: string) => ['course-modules', courseId]
const getCourseModuleQueryKey = (courseId: string, moduleId: string) => [
  'course-module',
  courseId,
  moduleId,
]

const invalidateModuleQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  moduleId?: string,
) => {
  queryClient.invalidateQueries({ queryKey: getCourseQueryKey(courseId) })
  queryClient.invalidateQueries({ queryKey: getCourseModulesQueryKey(courseId) })
  queryClient.invalidateQueries({ queryKey: ['course-feed', courseId] })
  queryClient.invalidateQueries({ queryKey: ['feed-paginated', courseId] })
  if (moduleId) {
    queryClient.invalidateQueries({
      queryKey: getCourseModuleQueryKey(courseId, moduleId),
    })
  }
}

const updateCourseDetailModules = (
  course: CourseDetail | undefined,
  updater: (modules: CourseDetail['modules']) => CourseDetail['modules'],
) => {
  if (!course) return course
  return {
    ...course,
    modules: updater(course.modules ?? []),
  }
}

const makeOptimisticModuleSummary = (
  data: ModuleCreateRequest,
  tempId: string,
): ModuleSummary => {
  const now = new Date().toISOString()

  return {
    uuid: tempId,
    name: data.name,
    description: data.description ?? null,
    status: data.status ?? 'passive',
    createdAt: now,
    updatedAt: now,
  }
}

const makeOptimisticModuleDetail = (
  data: ModuleCreateRequest,
  tempId: string,
): ModuleDetail => ({
  ...makeOptimisticModuleSummary(data, tempId),
  materials: [],
  quizzes: [],
})

const reorderByIds = <T extends { uuid: string }>(items: T[], ids: string[]) => {
  const map = new Map(items.map((item) => [item.uuid, item]))
  const ordered = ids.map((id) => map.get(id)).filter(Boolean) as T[]
  const remaining = items.filter((item) => !ids.includes(item.uuid))
  return [...ordered, ...remaining]
}

export const useCreateModuleMutation = (
  courseId: string,
  setDraftModule?: (a: ModuleSummary | null) => void,
) => {
  const queryClient = useQueryClient()
  const modulesQueryKey = getCourseModulesQueryKey(courseId)
  const courseQueryKey = getCourseQueryKey(courseId)

  return useMutation<
    ModuleSummary,
    ApiError,
    ModuleCreateRequest,
    { previousModules?: ModuleSummary[]; previousCourse?: CourseDetail }
  >({
    mutationFn: (data) => createModule(courseId, data),
    networkMode: 'always',
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: modulesQueryKey })
      await queryClient.cancelQueries({ queryKey: courseQueryKey })

      const previousModules = queryClient.getQueryData<ModuleSummary[]>(
        modulesQueryKey,
      )
      const previousCourse = queryClient.getQueryData<CourseDetail>(courseQueryKey)
      const tempId = `temp-${Date.now()}`
      const optimisticSummary = makeOptimisticModuleSummary(data, tempId)
      const optimisticDetail = makeOptimisticModuleDetail(data, tempId)

      queryClient.setQueryData<ModuleSummary[]>(modulesQueryKey, (oldModules) => {
        if (!oldModules) return oldModules
        return [...oldModules, optimisticSummary]
      })

      queryClient.setQueryData<CourseDetail>(courseQueryKey, (oldCourse) =>
        updateCourseDetailModules(oldCourse, (modules) => [...modules, optimisticDetail]),
      )

      return { previousModules, previousCourse }
    },
    onSuccess: () => {
      invalidateModuleQueries(queryClient, courseId)
      setDraftModule?.(null)
      toast.success('Modul vytvořen')
    },
    onError: (error, _variables, context) => {
      if (context?.previousCourse !== undefined) {
        queryClient.setQueryData(courseQueryKey, context.previousCourse)
      }
      onErrorWithRollback(
        error,
        'Chyba při vytváření modulu',
        queryClient,
        modulesQueryKey,
        context?.previousModules,
      )
    },
  })
}

export const useUpdateModuleMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  const modulesQueryKey = getCourseModulesQueryKey(courseId)
  const courseQueryKey = getCourseQueryKey(courseId)

  return useMutation<
    ModuleSummary,
    ApiError,
    { moduleId: string; data: ModuleUpdateRequest },
    {
      previousModules?: ModuleSummary[]
      previousCourse?: CourseDetail
      previousModule?: ModuleDetail
    }
  >({
    mutationFn: ({ moduleId, data }) => updateModule(courseId, moduleId, data),
    networkMode: 'always',
    onMutate: async ({ moduleId, data }) => {
      const moduleQueryKey = getCourseModuleQueryKey(courseId, moduleId)

      await queryClient.cancelQueries({ queryKey: modulesQueryKey })
      await queryClient.cancelQueries({ queryKey: courseQueryKey })
      await queryClient.cancelQueries({ queryKey: moduleQueryKey })

      const previousModules = queryClient.getQueryData<ModuleSummary[]>(
        modulesQueryKey,
      )
      const previousCourse = queryClient.getQueryData<CourseDetail>(courseQueryKey)
      const previousModule = queryClient.getQueryData<ModuleDetail>(moduleQueryKey)

      queryClient.setQueryData<ModuleSummary[]>(modulesQueryKey, (oldModules) => {
        if (!oldModules) return oldModules
        return oldModules.map((module) =>
          module.uuid === moduleId ? { ...module, ...data } : module,
        )
      })

      queryClient.setQueryData<CourseDetail>(courseQueryKey, (oldCourse) =>
        updateCourseDetailModules(oldCourse, (modules) =>
          modules.map((module) =>
            module.uuid === moduleId ? { ...module, ...data } : module,
          ),
        ),
      )

      queryClient.setQueryData<ModuleDetail>(moduleQueryKey, (oldModule) => {
        if (!oldModule) return oldModule
        return { ...oldModule, ...data }
      })

      return { previousModules, previousCourse, previousModule }
    },
    onSuccess: (updatedModule, { moduleId }) => {
      const moduleQueryKey = getCourseModuleQueryKey(courseId, moduleId)

      queryClient.setQueryData<ModuleDetail>(moduleQueryKey, (oldModule) => {
        if (!oldModule) return oldModule
        return {
          ...oldModule,
          ...updatedModule,
        }
      })

      invalidateModuleQueries(queryClient, courseId, moduleId)
      toast.success('Modul aktualizován')
    },
    onError: (error, variables, context) => {
      const moduleQueryKey = getCourseModuleQueryKey(courseId, variables.moduleId)

      if (context?.previousCourse !== undefined) {
        queryClient.setQueryData(courseQueryKey, context.previousCourse)
      }
      if (context?.previousModule !== undefined) {
        queryClient.setQueryData(moduleQueryKey, context.previousModule)
      }

      onErrorWithRollback(
        error,
        'Chyba při aktualizaci modulu',
        queryClient,
        modulesQueryKey,
        context?.previousModules,
      )
    },
  })
}

export const useDeleteModuleMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  const modulesQueryKey = getCourseModulesQueryKey(courseId)
  const courseQueryKey = getCourseQueryKey(courseId)

  return useMutation<
    void,
    ApiError,
    string,
    { previousModules?: ModuleSummary[]; previousCourse?: CourseDetail }
  >({
    mutationFn: (moduleId) => deleteModule(courseId, moduleId),
    networkMode: 'always',
    onMutate: async (moduleId) => {
      await queryClient.cancelQueries({ queryKey: modulesQueryKey })
      await queryClient.cancelQueries({ queryKey: courseQueryKey })
      await queryClient.cancelQueries({
        queryKey: getCourseModuleQueryKey(courseId, moduleId),
      })

      const previousModules = queryClient.getQueryData<ModuleSummary[]>(
        modulesQueryKey,
      )
      const previousCourse = queryClient.getQueryData<CourseDetail>(courseQueryKey)

      queryClient.setQueryData<ModuleSummary[]>(modulesQueryKey, (oldModules) => {
        if (!oldModules) return oldModules
        return oldModules.filter((module) => module.uuid !== moduleId)
      })

      queryClient.setQueryData<CourseDetail>(courseQueryKey, (oldCourse) =>
        updateCourseDetailModules(oldCourse, (modules) =>
          modules.filter((module) => module.uuid !== moduleId),
        ),
      )

      return { previousModules, previousCourse }
    },
    onSuccess: (_data, moduleId) => {
      queryClient.removeQueries({
        queryKey: getCourseModuleQueryKey(courseId, moduleId),
      })
      invalidateModuleQueries(queryClient, courseId)
      toast.success('Modul smazán')
    },
    onError: (error, _variables, context) => {
      if (context?.previousCourse !== undefined) {
        queryClient.setQueryData(courseQueryKey, context.previousCourse)
      }
      onErrorWithRollback(
        error,
        'Chyba při mazání modulu',
        queryClient,
        modulesQueryKey,
        context?.previousModules,
      )
    },
  })
}

export const useReorderModulesMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  const modulesQueryKey = getCourseModulesQueryKey(courseId)
  const courseQueryKey = getCourseQueryKey(courseId)

  return useMutation<
    ModuleSummary[],
    ApiError,
    ModuleReorderRequest,
    { previousModules?: ModuleSummary[]; previousCourse?: CourseDetail }
  >({
    mutationFn: (data) => reorderModules(courseId, data),
    networkMode: 'always',
    onMutate: async ({ moduleIds }) => {
      await queryClient.cancelQueries({ queryKey: modulesQueryKey })
      await queryClient.cancelQueries({ queryKey: courseQueryKey })

      const previousModules = queryClient.getQueryData<ModuleSummary[]>(
        modulesQueryKey,
      )
      const previousCourse = queryClient.getQueryData<CourseDetail>(courseQueryKey)

      queryClient.setQueryData<ModuleSummary[]>(modulesQueryKey, (oldModules) => {
        if (!oldModules) return oldModules
        return reorderByIds(oldModules, moduleIds)
      })

      queryClient.setQueryData<CourseDetail>(courseQueryKey, (oldCourse) =>
        updateCourseDetailModules(oldCourse, (modules) =>
          reorderByIds(modules, moduleIds),
        ),
      )

      return { previousModules, previousCourse }
    },
    onSuccess: (updatedModules) => {
      queryClient.setQueryData<ModuleSummary[]>(modulesQueryKey, updatedModules)
      invalidateModuleQueries(queryClient, courseId)
      toast.success('Pořadí modulů aktualizováno')
    },
    onError: (error, _variables, context) => {
      if (context?.previousCourse !== undefined) {
        queryClient.setQueryData(courseQueryKey, context.previousCourse)
      }
      onErrorWithRollback(
        error,
        'Chyba při změně pořadí modulů',
        queryClient,
        modulesQueryKey,
        context?.previousModules,
      )
    },
  })
}
