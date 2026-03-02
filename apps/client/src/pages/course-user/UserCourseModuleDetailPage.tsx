import MaterialCard from '@/components/shared/MaterialComponent'
import QuizComponent from '@/components/shared/Quiz/QuizComponent'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import CoursesPageSceleton from '@/components/shared/loadingskeleton/CoursesSceleton'
import { Label } from '@/components/ui/label'
import type { Quiz } from '@/lib/schemas'
import type { QuizStateById } from '@/lib/types'
import { startTransition, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuizSubmitMutation } from '../CoursePage/utils/quizSubmitMutation'
import {
  handleSubmitQuiz,
  isQuizComplete,
} from '../CoursePage/utils/helperFunctions'
import quizImg from '@/assets/t-play-blue.svg'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'
import UserModuleTab from '../dashboard/components/ModuleTab'
import SummarySection from '../CoursePage/components/SummarySection'
import {
  clearQuizSubmission,
  getQuizSubmission,
} from '../CoursePage/utils/quizSubmissionStorage'

const UserCourseModuleDetailPage = () => {
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId: string
  }>()
  const { courseData, activeModules } = useUserCourseLayoutContext()
  const [quizState, setQuizState] = useState<QuizStateById>({})
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null)
  const quizMutation = useQuizSubmitMutation(setQuizState)

  const selectedModule =
    activeModules.find((module) => module.uuid === moduleId) ?? null

  useTitle(selectedModule?.name || `${courseData.name} - modul`)

  useEffect(() => {
    if (!selectedModule?.quizzes?.length) return

    const initialResults: QuizStateById = {}
    selectedModule.quizzes.forEach((quiz) => {
      if (!quiz.uuid) return

      const stored = getQuizSubmission(quiz.uuid)

      initialResults[quiz.uuid] = {
        status: stored ? 'submitted' : 'idle',
        answers: stored
          ? Object.fromEntries(
              stored.answers.map((answer) => [answer.uuid, answer]),
            )
          : {},
        showCorrect: false,
        results: stored?.results,
      }
    })

    startTransition(() => {
      setQuizState((prev) => {
        if (Object.keys(prev).length) return prev
        return initialResults
      })
    })
  }, [selectedModule?.quizzes])

  if (!courseId || !moduleId) {
    return <StateComp type='not-found' message='Modul nebyl nalezen' />
  }

  if (!selectedModule) {
    return <CoursesPageSceleton />
  }

  return (
    <>
      <div className='relative flex flex-col gap-2 md:flex-row md:items-center md:gap-6 mb-3'>
        <div className='flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap md:flex-1 overflow-x-auto'>
          {activeModules.map((module, index) => (
            <UserModuleTab key={module.uuid} module={module} index={index} />
          ))}
        </div>
      </div>

      <div className='space-y-5'>
        <SummarySection
          name={selectedModule.name}
          description={selectedModule.description ?? undefined}
          breadcrumbs={[
            { label: 'Kurzy', path: '/courses' },
            { label: courseData.name, path: `/courses/${courseId}` },
            { label: selectedModule.name },
          ]}
        />

        <section>
          <Label className='font-bold mb-3'>
            <UnderlinedText strokeWidth='4'>Studijní Materiály</UnderlinedText>
          </Label>
          <div className='space-y-3'>
            {selectedModule.materials.length ? (
              selectedModule.materials.map((material) => (
                <MaterialCard
                  key={material.uuid}
                  material={material}
                  type='classic'
                />
              ))
            ) : (
              <StateComp
                type='no-content'
                message='Zatím žádné materiály'
                className='pt-8 pb-0'
              />
            )}
          </div>
        </section>

        <section>
          <Label className='font-bold mb-3'>
            <UnderlinedText offset='-bottom-0.5' strokeWidth='4'>
              Kvízy
            </UnderlinedText>
          </Label>

          <div className='space-y-4'>
            {selectedModule.quizzes.length ? (
              selectedModule.quizzes.map((quiz: Quiz) => (
                <QuizComponent
                  key={quiz.uuid}
                  quiz={quiz}
                  mode='user'
                  userState={quizState[quiz.uuid!]}
                  onAnswerChange={(questionId, answer) => {
                    setQuizState((prev) => {
                      const currentQuizState = prev[quiz.uuid!] || {
                        status: 'idle' as const,
                        answers: {},
                        showCorrect: false,
                      }

                      return {
                        ...prev,
                        [quiz.uuid!]: {
                          ...currentQuizState,
                          answers: {
                            ...currentQuizState.answers,
                            [questionId]: { uuid: questionId, ...answer },
                          },
                        },
                      }
                    })
                  }}
                  onSubmit={() =>
                    handleSubmitQuiz(
                      courseId,
                      moduleId,
                      quiz.uuid!,
                      quizState,
                      quizMutation,
                    )
                  }
                  onReset={() => {
                    clearQuizSubmission(quiz.uuid!)
                    setQuizState((prev) => ({
                      ...prev,
                      [quiz.uuid!]: {
                        status: 'idle' as const,
                        answers: {},
                        showCorrect: false,
                      },
                    }))
                  }}
                  onToggleShowCorrect={() => {
                    setQuizState((prev) => {
                      const currentQuizState = prev[quiz.uuid!] || {
                        status: 'idle' as const,
                        answers: {},
                        showCorrect: false,
                      }

                      return {
                        ...prev,
                        [quiz.uuid!]: {
                          ...currentQuizState,
                          showCorrect: !currentQuizState.showCorrect,
                        },
                      }
                    })
                  }}
                  isSubmitDisabled={
                    !isQuizComplete(
                      quiz.uuid!,
                      quiz.questions.length,
                      quizState,
                    ) || quizState[quiz.uuid!]?.status === 'submitted'
                  }
                  isSubmitting={
                    quizMutation.variables?.quizId === quiz.uuid &&
                    quizMutation.isPending
                  }
                  isExpanded={expandedQuizId === quiz.uuid}
                  onToggleExpand={() => {
                    setExpandedQuizId(
                      expandedQuizId === quiz.uuid ? null : (quiz.uuid ?? null),
                    )
                  }}
                />
              ))
            ) : (
              <StateComp
                img={quizImg}
                iconClassName='w-12 h-12 md:w-14 h-14'
                type='no-content'
                message='Zatím žádné kvízy'
                className='pt-8 pb-0'
              />
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default UserCourseModuleDetailPage
