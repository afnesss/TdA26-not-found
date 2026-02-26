import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import type { Quiz } from '@/lib/schemas'
import DashboardAddButton from './DashboardAddButton'

interface QuizzesSectionProps {
  quizzes: Quiz[]
  draftQuiz: Quiz | null
  expandedQuizIds: string[]
  previewMode: boolean
  canEdit: boolean
  isCreating: boolean
  isUpdating: boolean
  onAddQuiz: () => void
  onUpdateQuiz: (quizId: string, quiz: Quiz) => void
  onDeleteQuiz: (quizId: string) => void
  onCreateQuiz: (quiz: Quiz) => void
  onCancelDraft: () => void
  onToggleExpand: (quizId: string) => void
}

const QuizzesSection = ({
  quizzes,
  draftQuiz,
  expandedQuizIds,
  previewMode,
  canEdit,
  isCreating,
  isUpdating,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onCreateQuiz,
  onCancelDraft,
  onToggleExpand,
}: QuizzesSectionProps) => {
  const isEmpty = !draftQuiz && quizzes.length === 0

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Label className='font-bold mb-0'>
          <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
            Kvízy
          </UnderlinedText>
        </Label>
        {canEdit && (
          <DashboardAddButton
            label='Přidat kvíz'
            onClick={onAddQuiz}
            disabled={!!draftQuiz}
          />
        )}
      </div>

      <div className='space-y-3'>
        {isEmpty ? (
          <StateComp
            type='no-content'
            message='Zatím žádné kvízy'
            className='pt-8 pb-0'
          />
        ) : (
          <>
            {draftQuiz && (
              <QuizComponent
                key={draftQuiz.uuid}
                quiz={draftQuiz}
                mode='lecturer'
                isDraft={true}
                isExpanded={true}
                onCancelDraft={onCancelDraft}
                onSave={onCreateQuiz}
                isSubmitting={isCreating}
              />
            )}
            {quizzes.map((quiz) => {
              const quizId = quiz.uuid

              return (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode='lecturer'
                  onSave={(updatedQuiz) => {
                    if (quizId) onUpdateQuiz(quizId, updatedQuiz)
                  }}
                  isSubmitting={isUpdating}
                  onDelete={() => {
                    if (quizId) onDeleteQuiz(quizId)
                  }}
                  isExpanded={expandedQuizIds.includes(quizId!)}
                  onToggleExpand={() => {
                    if (!quizId) return
                    onToggleExpand(quizId)
                  }}
                />
              )
            })}
          </>
        )}
      </div>
    </section>
  )
}

export default QuizzesSection
