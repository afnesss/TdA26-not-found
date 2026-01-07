import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Question, Quiz } from '@/lib/schemas'
import type { QuizState } from '@/lib/types'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
} from 'lucide-react'
import { Fragment, useState } from 'react'
import { Textarea } from '../../ui/textarea'
import QuizQuestion from './QuizQuestion'

type QuestionType = 'singleChoice' | 'multipleChoice'

type QuizComponentProps = {
  quiz: Quiz
  mode: 'user' | 'lecturer'

  // User mode props
  userState?: QuizState
  onAnswerChange?: (
    questionId: string,
    answer: { selectedIndex?: number; selectedIndices?: number[] },
  ) => void
  onSubmit?: () => void
  onToggleShowCorrect?: () => void
  isSubmitting?: boolean
  isSubmitDisabled?: boolean

  // Lecturer mode props
  onSave?: (quiz: Quiz) => void
  onDelete?: () => void
}

const QuizComponent = ({
  quiz,
  mode,
  userState,
  onAnswerChange,
  onSubmit,
  onToggleShowCorrect,
  isSubmitting,
  isSubmitDisabled,
  onSave,
  onDelete,
}: QuizComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize edited quiz when expanding in lecturer mode
  const toggleExpand = () => {
    if (!isExpanded && mode === 'lecturer') {
      setEditedQuiz(JSON.parse(JSON.stringify(quiz)))
      setHasChanges(false)
    }
    setIsExpanded(!isExpanded)
  }

  const markAsChanged = () => {
    if (mode === 'lecturer') {
      setHasChanges(true)
    }
  }

  // Lecturer edit functions
  const updateTitle = (title: string) => {
    setEditedQuiz({ ...editedQuiz, title })
    markAsChanged()
  }

  const updateQuestionText = (qIndex: number, text: string) => {
    const newQuestions = [...editedQuiz.questions]
    newQuestions[qIndex] = { ...newQuestions[qIndex], question: text }
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const updateQuestionType = (qIndex: number, type: QuestionType) => {
    const newQuestions = [...editedQuiz.questions] as Question[]
    const oldQuestion = newQuestions[qIndex]

    const newQuestion: Question =
      type === 'singleChoice'
        ? {
            uuid: oldQuestion.uuid,
            type: 'singleChoice',
            question: oldQuestion.question,
            options: oldQuestion.options,
            correctIndex: 0,
          }
        : {
            uuid: oldQuestion.uuid,
            type: 'multipleChoice',
            question: oldQuestion.question,
            options: oldQuestion.options,
            correctIndices: [0],
          }

    newQuestions[qIndex] = newQuestion
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...editedQuiz.questions]
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: newQuestions[qIndex].options.map((opt, i) =>
        i === optIndex ? value : opt,
      ),
    }
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const toggleCorrectAnswer = (qIndex: number, optIndex: number) => {
    const newQuestions = [...editedQuiz.questions] as Question[]
    const question = { ...newQuestions[qIndex] } as Question

    if (question.type === 'singleChoice') {
      question.correctIndex = optIndex
    } else {
      const indices = question.correctIndices || []
      question.correctIndices = indices.includes(optIndex)
        ? indices.filter((i) => i !== optIndex)
        : [...indices, optIndex]
    }

    newQuestions[qIndex] = question
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const addOption = (qIndex: number) => {
    const newQuestions = [...editedQuiz.questions]
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: [...newQuestions[qIndex].options, 'Nová možnost'],
    }
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQuestions = [...editedQuiz.questions]
    const question = { ...newQuestions[qIndex] }

    question.options = question.options.filter((_, i) => i !== optIndex)

    if (question.type === 'singleChoice') {
      if (question.correctIndex === optIndex) {
        question.correctIndex = 0
      } else if (question.correctIndex! > optIndex) {
        question.correctIndex! -= 1
      }
    } else {
      question.correctIndices = (question.correctIndices || [])
        .filter((i) => i !== optIndex)
        .map((i) => (i > optIndex ? i - 1 : i))
    }

    newQuestions[qIndex] = question
    setEditedQuiz({ ...editedQuiz, questions: newQuestions })
    markAsChanged()
  }

  const addQuestion = () => {
    setEditedQuiz({
      ...editedQuiz,
      questions: [
        ...editedQuiz.questions,
        {
          uuid: `temp-${Date.now()}`,
          type: 'singleChoice',
          question: 'Nová otázka',
          options: ['Možnost 1', 'Možnost 2'],
          correctIndex: 0,
        },
      ],
    })
    markAsChanged()
  }

  const removeQuestion = (qIndex: number) => {
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.filter((_, i) => i !== qIndex),
    })
    markAsChanged()
  }

  const handleSave = () => {
    if (onSave) {
      onSave(editedQuiz)
      setHasChanges(false)
    }
  }

  const displayQuiz = mode === 'lecturer' ? editedQuiz : quiz

  return (
    <div className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
      {/* Header */}
      <div
        className='p-3.5 md:px-5 md:py-4 cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={toggleExpand}
      >
        <div className='flex items-center justify-between gap-2 sm:gap-4'>
          {/* Ліва частина - контент */}
          <div className='flex-1 min-w-0'>
            {/* Badge над назвою - тільки на малих екранах */}
            {mode === 'lecturer' && hasChanges && (
              <span className='sm:hidden inline-block text-[10px] font-medium text-primary px-1.5 py-0.5 bg-primary/10 rounded-full mb-1.5'>
                Neuloženo
              </span>
            )}

            {/* Назва квізу */}
            {mode === 'lecturer' && isExpanded ? (
              <Textarea
                className='text-sm sm:text-md md:text-lg font-bold p-1'
                variant={'ghost'}
                value={displayQuiz.title}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateTitle(e.target.value)}
              />
            ) : (
              <Label
                className='text-sm sm:text-base md:text-lg font-bold leading-tight mb-1.5 sm:mb-3 block'
                variant={'name'}
              >
                {quiz.title}
              </Label>
            )}

            {/* Статистика */}
            <div className='flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1'>
              <span className='flex items-center gap-1 whitespace-nowrap'>
                <CheckCircle size={14} className='text-primary shrink-0' />
                <span>{displayQuiz.attemptsCount} vyplnění</span>
              </span>

              <span className='flex items-center gap-1 whitespace-nowrap'>
                <HelpCircle size={14} className='text-secondary shrink-0' />
                <span>{displayQuiz.questions.length} otázek</span>
              </span>
            </div>
          </div>

          <div className='flex items-center gap-1 sm:gap-2 shrink-0 self-center'>
            {mode === 'lecturer' && hasChanges && (
              <span className='hidden sm:inline-block text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full whitespace-nowrap'>
                Neuloženo
              </span>
            )}

            {mode === 'lecturer' && (
              <EditBtn
                type='delete'
                onClick={(e) => {
                  e?.stopPropagation()
                  onDelete?.()
                }}
              />
            )}

            <button className='p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0'>
              {isExpanded ? (
                <ChevronUp
                  size={20}
                  strokeWidth={2.5}
                  className='text-secondary'
                />
              ) : (
                <ChevronDown
                  size={20}
                  strokeWidth={2.5}
                  className='text-secondary'
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='p-3 md:p-5 space-y-4 border-t border-gray-100 bg-gray-50/50'>
          {/* Questions */}
          {displayQuiz.questions.map((origQuestion, qIndex) => {
            const question = origQuestion as Question
            return (
              <Fragment key={question.uuid ?? qIndex}>
                <QuizQuestion
                  question={question}
                  qIndex={qIndex}
                  mode={mode}
                  // lecturer props
                  onQuestionTextUpdate={(text) =>
                    updateQuestionText(qIndex, text)
                  }
                  onQuestionTypeChange={(type) =>
                    updateQuestionType(qIndex, type)
                  }
                  onQuestionRemove={() => removeQuestion(qIndex)}
                  onOptionUpdate={(optIndex, value) =>
                    updateOption(qIndex, optIndex, value)
                  }
                  onOptionRemove={(optIndex) => removeOption(qIndex, optIndex)}
                  onCorrectToggle={(optIndex) =>
                    toggleCorrectAnswer(qIndex, optIndex)
                  }
                  onAddOption={() => addOption(qIndex)}
                  // user props
                  userState={userState}
                  onAnswerChange={onAnswerChange}
                />

                {qIndex < displayQuiz.questions.length - 1 && (
                  <hr className='border-b border mt-2 border-gray-100' />
                )}
              </Fragment>
            )
          })}

          {mode === 'lecturer' && (
            <Button
              variant='outline'
              size='default'
              onClick={addQuestion}
              className='w-full border-dashed border-2 py-1 hover:border-primary hover:bg-primary/5'
            >
              <Plus size={20} />
              Přidat otázku
            </Button>
          )}

          {/* Footer Actions */}
          <div className='flex flex-col lg:mx-10 pt-4 border-t-2 border-gray-100'>
            {mode === 'user' ? (
              <div className='flex flex-row items-center justify-between'>
                <div className='flex items-center gap-3 md:gap-10 flex-col md:flex-row'>
                  <Button
                    variant='primary'
                    size='grid'
                    className='w-fit'
                    disabled={isSubmitDisabled || isSubmitting}
                    onClick={onSubmit}
                  >
                    Odeslat odpovědi
                  </Button>

                  <Button
                    variant='link'
                    className='rounded-lg shadow-none'
                    disabled={userState?.status !== 'submitted'}
                    onClick={onToggleShowCorrect}
                  >
                    {userState?.showCorrect
                      ? 'Skrýt odpovědi'
                      : 'Zobrazit odpovědi'}
                  </Button>
                </div>

                {userState?.status === 'submitted' && userState.results && (
                  <Label
                    className='text-primary flex items-center gap-3'
                    size={'lg'}
                  >
                    <CheckCircle size={20} />
                    {userState.results.score} / {userState.results.maxScore}
                  </Label>
                )}
              </div>
            ) : (
              <div className='flex justify-end'>
                <Button
                  variant='primary'
                  size='grid'
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  Uložit změny
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizComponent
