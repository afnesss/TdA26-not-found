import { createQuiz, getQuizzes, updateQuiz } from '@/api/queries/quizQueries'
import { QuizzesContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import DetailHeader from './DetailHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Quiz } from '@/lib/schemas'
import { toast } from 'sonner'
import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import quizImg from '../../../assets/t-play-blue.svg'

const QuizzesTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const queryClient = useQueryClient()
  const [draftQuiz, setDraftQuiz] = useState<Quiz | null>(null)

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

  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: Quiz }) =>
      updateQuiz(courseId!, quizId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      toast.success('Kvíz byl aktualizován')
    },
    onError: () => {
      toast.error('Chyba při ukládání')
    },
  })

  const createQuizMutation = useMutation({
    mutationFn: (data: Quiz) => createQuiz(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      setDraftQuiz(null)
      toast.success('Kvíz byl vytvořen')
    },
    onError: () => {
      toast.error('Chyba při ukládání')
    },
  })

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
    updateQuizMutation.mutate({
      quizId,
      data: cleanedQuiz,
    })
  }
  const handleCreateQuiz = (editedQuiz: Quiz) => {
    const cleanedQuiz: Quiz = {
      ...editedQuiz,
      // Видалити uuid з квізу та питань для створення
      uuid: undefined,
      questions: editedQuiz.questions.map((q) => {
        const { uuid, ...questionWithoutUuid } = q
        return questionWithoutUuid
      }),
    }
    createQuizMutation.mutate(cleanedQuiz)
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
              isSubmitting={createQuizMutation.isPending}
              onDelete={() => {
                console.log('Delete:', draftQuiz.uuid)
              }}
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
                isSubmitting={updateQuizMutation.isPending}
                onDelete={() => {
                  console.log('Delete:', quiz.uuid)
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
