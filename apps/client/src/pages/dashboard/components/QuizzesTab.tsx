import { getQuizzes } from '@/api/queries/quizQueries'
import quizImg from '@/assets/t-play-blue.svg'
import { QuizzesContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import type { Quiz } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useUpdateQuizMutation,
} from '../../CoursePage/utils/useQuizMutation'
import DetailHeader from './DetailHeader'

const QuizzesTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const [draftQuiz, setDraftQuiz] = useState<Quiz | null>(null)

  const {
    data: quizzes = [],
    isError: quizzesError,
    error: quizzesErrorObj,
    isLoading: quizzesLoading,
    refetch: refetchQuizzes,
  } = useQuery<Quiz[] | null, ApiError>({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzes(courseId!),
    enabled: Boolean(courseId) && activeTab === 'quizzes',
  })

  const isNetworkError = quizzesErrorObj?.isNetworkError ?? false

  const { mutate: createQuizMutation, isPending: createQuizPending } =
    useCreateQuizMutation(courseId, setDraftQuiz)
  const { mutate: updateQuizMutation, isPending: updateQuizPending } =
    useUpdateQuizMutation(courseId)
  const { mutate: deleteQuizMutation } = useDeleteQuizMutation(courseId)

  const handleUpdate = (quizId: string, editedQuiz: Quiz) => {
    const cleanedQuiz: Quiz = {
      ...editedQuiz,
      questions: editedQuiz.questions.map((q) => {
        if (q.uuid?.startsWith('temp-')) {
          const { uuid, ...questionWithoutUuid } = q
          return questionWithoutUuid
        }
        return q
      }),
    }
    updateQuizMutation({
      quizId,
      data: cleanedQuiz,
    })
  }
  const handleCreateQuiz = (editedQuiz: Quiz) => {
    const cleanedQuiz: Quiz = {
      ...editedQuiz,
      uuid: undefined,
      questions: editedQuiz.questions.map((q) => {
        const { uuid, ...questionWithoutUuid } = q
        return questionWithoutUuid
      }),
    }
    createQuizMutation(cleanedQuiz)
  }
  const handleAddQuiz = () => {
    const newDraft: Quiz = {
      uuid: `temp-${Date.now()}`,
      title: '',
      attemptsCount: 0,
      questions: [
        {
          uuid: `temp-${Date.now()}`,
          type: 'singleChoice',
          question: '',
          options: ['', ''],
          correctIndex: 0,
        },
      ],
    }
    setDraftQuiz(newDraft)
  }

  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={handleAddQuiz}
        title='Kvízy'
        gradient='accent-teal'
        buttonText='Vytvořit kvíz'
      />

      {quizzesLoading ? (
        <QuizzesContentSkeleton />
      ) : quizzesError ? (
        <StateComp
          type={isNetworkError ? 'network-offline' : 'error'}
          onAction={() => refetchQuizzes()}
          message={isNetworkError ? undefined : 'Nepodařilo se načíst kvízy'}
        />
      ) : (quizzes && quizzes.length > 0) || draftQuiz ? (
        <div className='grid gap-4'>
          {draftQuiz && (
            <QuizComponent
              key={draftQuiz.uuid}
              quiz={draftQuiz}
              mode='lecturer'
              isDraft={true}
              onCancelDraft={() => setDraftQuiz(null)}
              onSave={async (updatedQuiz) => {
                handleCreateQuiz(updatedQuiz)
              }}
              isSubmitting={createQuizPending}
            />
          )}
          {quizzes &&
            quizzes.length > 0 &&
            quizzes.map((quiz) => (
              <QuizComponent
                key={quiz.uuid}
                quiz={quiz}
                mode='lecturer'
                onSave={async (updatedQuiz) => {
                  handleUpdate(quiz.uuid!, updatedQuiz)
                }}
                isSubmitting={updateQuizPending}
                onDelete={() => {
                  deleteQuizMutation(quiz.uuid!)
                }}
              />
            ))}
        </div>
      ) : (
        <StateComp
          img={quizImg}
          iconClassName='w-12 h-12 md:w-14 h-14'
          type='no-content'
          message='Zatím žádné kvízy'
        />
      )}
    </div>
  )
}

export default QuizzesTab
