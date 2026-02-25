import type { CourseDetail, CourseStatus, FeedItem } from '@/lib/schemas'
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

export const useCourseFeedSSE = ({ courseId }: { courseId: string }) => {
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
      toast.info(newPost.message)
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

      if (updatedCourse.status === 'paused') {
        toast.info(`Kurz "${updatedCourse.name}" pozastaveno lektorem`)
      } else if (updatedCourse.status === 'archived') {
        toast.info(`Kurz "${updatedCourse.name}" dokončeno lektorem`)
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
  }, [courseId, queryClient])

  return { isConnected }
}
