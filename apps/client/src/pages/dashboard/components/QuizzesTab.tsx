import { getQuizzes, updateQuiz } from '@/api/queries/quizQueries'
import { QuizzesContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import DetailHeader from './DetailHeader'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Quiz } from '@/lib/schemas'

const QuizzesTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const queryClient = useQueryClient()

  const {
    data: quizzes = [],
    isError: quizzesError,
    isLoading: quizzesLoading,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null>({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzes(courseId!),
    enabled: Boolean(courseId) && activeTab === 'quizzes',
  })
  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={() => {
          console.log('зробити kviz')
        }}
        title='Kvízy kurzu'
        gradient='accent-teal'
        buttonText='Vytvořit kvíz'
      />

      {quizzesLoading ? (
        <QuizzesContentSkeleton />
      ) : quizzesError ? (
        <StateComp
          type='error'
          onAction={() => refetchQuizzes()}
          message='Nepodařilo se načíst kvízy'
        />
      ) : quizzes && quizzes.length > 0 ? (
        <div className='grid gap-4'>
          {quizzes.map((quiz) => (
            <QuizComponent
              key={quiz.uuid}
              quiz={quiz}
              mode='lecturer'
              onSave={async (updatedQuiz) => {
                if (courseId) {
                  await updateQuiz(courseId, quiz.uuid!, updatedQuiz)
                  queryClient.invalidateQueries({
                    queryKey: ['quizzes', courseId],
                  })
                }
              }}
              onDelete={() => {
                console.log('Delete:', quiz.uuid)
              }}
            />
          ))}
        </div>
      ) : (
        <StateComp type='no-content' message='Zatím žádné kvízy' />
      )}
    </div>
  )
}

export default QuizzesTab
