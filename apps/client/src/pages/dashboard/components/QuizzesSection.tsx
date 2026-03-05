import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import type { Quiz } from '@/lib/schemas'
import type { CourseStatus } from '@/components/shared/CourseStateBadge'
import DashboardAddButton from './DashboardAddButton'
import quizImg from '@/assets/t-play-blue.svg'

interface QuizzesSectionProps {
  quizzes: Quiz[]
  draftQuiz: Quiz | null
  expandedQuizIds: string[]
  previewMode: boolean
  canEdit: boolean
  courseStatus: CourseStatus
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
  courseStatus,
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
  const isDraftCourse = courseStatus === 'draft'

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
            img={quizImg}
            iconClassName='w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16'
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
              const quizMode = isDraftCourse ? 'lecturer' : 'lecturer-preview'

              return (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode={quizMode}
                  onSave={
                    isDraftCourse
                      ? (updatedQuiz) => {
                          if (quizId) onUpdateQuiz(quizId, updatedQuiz)
                        }
                      : undefined
                  }
                  isSubmitting={isUpdating}
                  onDelete={
                    isDraftCourse
                      ? () => {
                          if (quizId) onDeleteQuiz(quizId)
                        }
                      : undefined
                  }
                  isExpanded={expandedQuizIds.includes(quizId!)}
                  onToggleExpand={() => {
                    if (!quizId) return
                    onToggleExpand(quizId)
                  }}
                  showAnalytics={
                    courseStatus === 'live' ||
                    courseStatus === 'archived' ||
                    courseStatus === 'paused'
                  }
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
