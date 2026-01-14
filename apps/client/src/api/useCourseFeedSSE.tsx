import type { CourseDetail, FeedItem } from '@/lib/schemas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

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

      queryClient.setQueryData<FeedItem[]>(['feed', courseId], (oldData) => {
        if (!oldData) return oldData
        return oldData.map((post) =>
          post.uuid === updatedPost.uuid ? updatedPost : post,
        )
      })
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

      // Update feed list cache for dashboard
      queryClient.setQueryData<FeedItem[]>(['feed', courseId], (oldData) => {
        if (!oldData) return oldData
        return oldData.filter((post) => post.uuid !== uuid)
      })
    })

    // --- Course Updates ---
    eventSource.addEventListener('course_updated', (event) => {
      const updatedCourse = JSON.parse(event.data)
      console.log('Course updated:', updatedCourse)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            name: updatedCourse.name,
            description: updatedCourse.description,
          }
        },
      )
    })

    // --- Material Updates ---
    eventSource.addEventListener('material_added', (event) => {
      const newMaterial = JSON.parse(event.data)
      console.log('Material added:', newMaterial)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            materials: [newMaterial, ...oldData.materials],
          }
        },
      )
    })

    eventSource.addEventListener('material_updated', (event) => {
      const updatedMaterial = JSON.parse(event.data)
      console.log('Material updated:', updatedMaterial)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            materials: oldData.materials.map((m) =>
              m.uuid === updatedMaterial.uuid ? updatedMaterial : m,
            ),
          }
        },
      )
    })

    eventSource.addEventListener('material_deleted', (event) => {
      const { uuid } = JSON.parse(event.data)
      console.log('Material deleted:', uuid)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            materials: oldData.materials.filter((m) => m.uuid !== uuid),
          }
        },
      )
    })

    // --- Quiz Updates ---
    eventSource.addEventListener('quiz_added', (event) => {
      const newQuiz = JSON.parse(event.data)
      console.log('Quiz added:', newQuiz)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            quizzes: [newQuiz, ...oldData.quizzes],
          }
        },
      )
    })

    eventSource.addEventListener('quiz_updated', (event) => {
      const updatedQuiz = JSON.parse(event.data)
      console.log('Quiz updated:', updatedQuiz)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            quizzes: oldData.quizzes.map((q) =>
              q.uuid === updatedQuiz.uuid ? updatedQuiz : q,
            ),
          }
        },
      )
    })

    eventSource.addEventListener('quiz_deleted', (event) => {
      const { uuid } = JSON.parse(event.data)
      console.log('Quiz deleted:', uuid)

      queryClient.setQueryData<CourseDetail>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            quizzes: oldData.quizzes.filter((q) => q.uuid !== uuid),
          }
        },
      )
    })

    return () => {
      console.log('SSE zavirame')
      eventSource.close()
      setIsConnected(false)
    }
  }, [courseId, queryClient])

  return { isConnected }
}
