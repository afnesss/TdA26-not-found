import { getFeed } from '@/api/queries/feedQueries'
import type { FeedItem } from '@/lib/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'

export const useFeedPagination = (
  courseId: string,
  initialData?: FeedItem[],
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed-paginated', courseId],
    queryFn: ({ pageParam }) => getFeed(courseId, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 15) return undefined

      return lastPage[lastPage.length - 1]?.createdAt
    },
    initialPageParam: undefined as string | undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    networkMode: 'always',
  })

  const [paginationError, setPaginationError] = useState(false)

  const loadMorePosts = async () => {
    setPaginationError(false)
    try {
      await fetchNextPage()
    } catch {
      setPaginationError(true)
    }
  }

  const allPosts = data?.pages.flat() ?? []

  return {
    allPosts,
    loadMorePosts,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    paginationError,
  }
}
