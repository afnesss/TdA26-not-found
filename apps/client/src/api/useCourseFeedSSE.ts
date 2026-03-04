import type { CourseDetail, CourseStatus, FeedItem } from '@/lib/schemas'
import type { ModuleDetail } from '@/lib/schemas/module'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type CourseModule = CourseDetail['modules'][number]
type CourseMaterial = CourseModule['materials'][number]
type CourseQuiz = CourseModule['quizzes'][number]

const updateCourseModules = (
  oldData: CourseDetail | undefined,
  updater: (module: CourseModule) => CourseModule,
) => {
  if (!oldData) return oldData

  return {
    ...oldData,
    modules: oldData.modules.map(updater),
  }
}

const parseMaterialPayload = (
  data: unknown,
): { moduleId: string; material: CourseMaterial } | null => {
  if (!data || typeof data !== 'object') return null

  const payload = data as {
    moduleId?: unknown
    material?: unknown
    uuid?: unknown
  }

  if (typeof payload.moduleId === 'string' && payload.material) {
    return {
      moduleId: payload.moduleId,
      material: payload.material as CourseMaterial,
    }
  }

  return null
}

const parseQuizPayload = (
  data: unknown,
): { moduleId: string; quiz: CourseQuiz } | null => {
  if (!data || typeof data !== 'object') return null

  const payload = data as {
    moduleId?: unknown
    quiz?: unknown
  }

  if (typeof payload.moduleId === 'string' && payload.quiz) {
    return {
      moduleId: payload.moduleId,
      quiz: payload.quiz as CourseQuiz,
    }
  }

  return null
}

type UseCourseFeedSSEOptions = {
  courseId: string
  syncModuleActivation?: boolean
  showNewPostToast?: boolean
  showSseToasts?: boolean
}

export const useCourseFeedSSE = ({
  courseId,
  syncModuleActivation = true,
  showNewPostToast = true,
  showSseToasts = true,
}: UseCourseFeedSSEOptions) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!courseId) return

    const eventSource = new EventSource(`/api/courses/${courseId}/feed/stream`)

    eventSource.onopen = () => {
      console.log('✅ SSE připojeno')
      setIsConnected(true)
    }

    eventSource.onerror = (err) => {
      console.log(' SSE chyba')
      console.error(' SSE onerror:', err)
      console.error('EventSource readyState:', eventSource.readyState)
      setIsConnected(false)
      eventSource.close()
    }

    eventSource.addEventListener('new_post', (event) => {
      const newPost = JSON.parse(event.data)
      console.log(' Received new_post event:', newPost)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            feed: [newPost, ...oldData.feed],
          }
        },
      )
      if (showSseToasts && showNewPostToast) {
        toast.info(newPost.message)
      }
      // Update feed-paginated cache
      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page, index) =>
              index === 0 ? [newPost, ...page] : page,
            ),
          }
        },
      )
    })

    eventSource.addEventListener('post_updated', (event) => {
      const updatedPost = JSON.parse(event.data)
      console.log('Post updated:', updatedPost)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            feed: oldData.feed.map((post) =>
              post.uuid === updatedPost.uuid ? updatedPost : post,
            ),
          }
        },
      )

      // Update feed-paginated cache
      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((post) =>
                post.uuid === updatedPost.uuid ? updatedPost : post,
              ),
            ),
          }
        },
      )
    })

    eventSource.addEventListener('post_deleted', (event) => {
      const { uuid } = JSON.parse(event.data)
      console.log(' Post deleted:', uuid)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            feed: oldData.feed.filter((post) => post.uuid !== uuid),
          }
        },
      )

      // Update feed-paginated cache
      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.filter((post) => post.uuid !== uuid),
            ),
          }
        },
      )
    })

    // --- Course Updates ---
    eventSource.addEventListener('course_updated', (event) => {
      const updatedCourse = JSON.parse(event.data)
      console.log('Course updated:', updatedCourse)

      if (showSseToasts && updatedCourse.status === 'paused') {
        toast.info(`Kurz "${updatedCourse.name}" byl pozastaven lektorem`)
      } else if (showSseToasts && updatedCourse.status === 'archived') {
        toast.info(`Kurz "${updatedCourse.name}" byl ukončen lektorem`)
      }

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            name: updatedCourse.name,
            description: updatedCourse.description,
            status_history: updatedCourse.status_history,
            startedAt: updatedCourse.startedAt,
            scheduledFor: updatedCourse.scheduledFor,
            updatedAt: updatedCourse.updatedAt,
            status: updatedCourse.status,
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
    })

    // --- Modules ---

    eventSource.addEventListener('module_activated', (event) => {
      if (!syncModuleActivation) return

      const activatedModule = JSON.parse(event.data)
      console.log('module activated:', activatedModule)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData

          const isLive = oldData.status === 'live'
          const isStatusOnlyChange = activatedModule.status !== undefined

          const allowed = isLive && isStatusOnlyChange

          if (!allowed) {
            console.warn(
              'Module update not allowed for course status:',
              oldData.status,
            )
            return oldData
          }

          return updateCourseModules(oldData, (module) =>
            module.uuid === (activatedModule as ModuleDetail).uuid
              ? { ...module, ...(activatedModule as ModuleDetail) }
              : module,
          )
        },
      )
    })
    const updateModuleCaches = (
      moduleId: string,
      updateCourseModule: (module: CourseModule) => CourseModule,
      updateModuleDetail: (module: ModuleDetail) => ModuleDetail,
    ) => {
      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return updateCourseModules(oldData, (module) =>
            module.uuid === moduleId ? updateCourseModule(module) : module,
          )
        },
      )

      queryClient.setQueryData<ModuleDetail>(
        ['course-module', courseId, moduleId],
        (oldData) => {
          if (!oldData) return oldData
          return updateModuleDetail(oldData)
        },
      )
    }

    const handleMaterialUpdated = (event: MessageEvent) => {
      const parsed = parseMaterialPayload(JSON.parse(event.data))
      if (!parsed) return

      updateModuleCaches(
        parsed.moduleId,
        (module) => ({
          ...module,
          materials: module.materials.map((m) =>
            m.uuid === parsed.material.uuid ? parsed.material : m,
          ),
        }),
        (moduleDetail) => ({
          ...moduleDetail,
          materials: moduleDetail.materials.map((material) =>
            material.uuid === parsed.material.uuid ? parsed.material : material,
          ),
        }),
      )
    }

    const handleQuizUpdated = (event: MessageEvent) => {
      const parsed = parseQuizPayload(JSON.parse(event.data))
      if (!parsed) return

      updateModuleCaches(
        parsed.moduleId,
        (module) => ({
          ...module,
          quizzes: module.quizzes.map((quiz) =>
            quiz.uuid === parsed.quiz.uuid ? parsed.quiz : quiz,
          ),
        }),
        (moduleDetail) => ({
          ...moduleDetail,
          quizzes: moduleDetail.quizzes.map((quiz) =>
            quiz.uuid === parsed.quiz.uuid ? parsed.quiz : quiz,
          ),
        }),
      )
      queryClient.invalidateQueries({
        queryKey: ['quizAnalytics', parsed.quiz.uuid],
      })
    }

    eventSource.addEventListener(
      'material_interaction_updated',
      handleMaterialUpdated,
    )
    eventSource.addEventListener('material_updated', handleMaterialUpdated)
    eventSource.addEventListener('quiz_stats_updated', handleQuizUpdated)
    eventSource.addEventListener('quiz_updated', handleQuizUpdated)

    // // --- Material Updates ---
    // eventSource.addEventListener('material_added', (event) => {
    //   const newMaterial = JSON.parse(event.data)
    //   console.log('Material added:', newMaterial)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       const moduleId = getPayloadModuleId(newMaterial)
    //       if (!moduleId) return oldData

    //       return updateCourseModules(oldData, (module) =>
    //         module.uuid === moduleId
    //           ? {
    //               ...module,
    //               materials: [
    //                 newMaterial as CourseMaterial,
    //                 ...module.materials,
    //               ],
    //             }
    //           : module,
    //       )
    //     },
    //   )
    // })

    // eventSource.addEventListener('material_updated', (event) => {
    //   const updatedMaterial = JSON.parse(event.data)
    //   console.log('Material updated:', updatedMaterial)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       return updateCourseModules(oldData, (module) => ({
    //         ...module,
    //         materials: module.materials.map((m) =>
    //           m.uuid === updatedMaterial.uuid
    //             ? (updatedMaterial as CourseMaterial)
    //             : m,
    //         ),
    //       }))
    //     },
    //   )
    // })

    // eventSource.addEventListener('material_deleted', (event) => {
    //   const { uuid } = JSON.parse(event.data)
    //   console.log('Material deleted:', uuid)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       return updateCourseModules(oldData, (module) => ({
    //         ...module,
    //         materials: module.materials.filter((m) => m.uuid !== uuid),
    //       }))
    //     },
    //   )
    // })

    // --- Quiz Updates ---
    // eventSource.addEventListener('quiz_added', (event) => {
    //   const newQuiz = JSON.parse(event.data)
    //   console.log('Quiz added:', newQuiz)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       const moduleId = getPayloadModuleId(newQuiz)
    //       if (!moduleId) return oldData

    //       return updateCourseModules(oldData, (module) =>
    //         module.uuid === moduleId
    //           ? {
    //               ...module,
    //               quizzes: [newQuiz as CourseQuiz, ...module.quizzes],
    //             }
    //           : module,
    //       )
    //     },
    //   )
    // })

    // eventSource.addEventListener('quiz_updated', (event) => {
    //   const updatedQuiz = JSON.parse(event.data)
    //   console.log('Quiz updated:', updatedQuiz)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       return updateCourseModules(oldData, (module) => ({
    //         ...module,
    //         quizzes: module.quizzes.map((q) =>
    //           q.uuid === updatedQuiz.uuid ? (updatedQuiz as CourseQuiz) : q,
    //         ),
    //       }))
    //     },
    //   )
    // })

    // eventSource.addEventListener('quiz_deleted', (event) => {
    //   const { uuid } = JSON.parse(event.data)
    //   console.log('Quiz deleted:', uuid)

    //   queryClient.setQueryData<CourseDetail>(
    //     ['course', courseId],
    //     (oldData) => {
    //       return updateCourseModules(oldData, (module) => ({
    //         ...module,
    //         quizzes: module.quizzes.filter((q) => q.uuid !== uuid),
    //       }))
    //     },
    //   )
    // })

    return () => {
      console.log('SSE zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [
    courseId,
    queryClient,
    showNewPostToast,
    showSseToasts,
    syncModuleActivation,
  ])

  return { isConnected }
}
