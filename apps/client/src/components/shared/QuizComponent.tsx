import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, Fragment } from 'react'
import {
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Star,
  Plus,
  X,
  Save,
  Trash2,
  Check,
  Play,
  Edit,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Quiz, Question, QuizAnswer } from '@/lib/schemas'
import type { QuizState } from '@/lib/types'
import EditBtn from '@/pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'

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
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4 flex-1'>
            <div className='flex-1'>
              {mode === 'lecturer' && isExpanded ? (
                <Textarea
                  className=' text-md md:text-xl font-bold'
                  variant={'ghost'}
                  value={displayQuiz.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateTitle(e.target.value)}
                />
              ) : (
                <Label className='mb-3' variant={'name'}>
                  {quiz.title}
                </Label>
              )}
              <div
                className='
                flex flex-wrap
                gap-x-4 gap-y-1
                text-sm text-gray-600
              '
              >
                <span className='flex items-center gap-1.5 whitespace-nowrap'>
                  <CheckCircle size={15} className='text-primary' />
                  <span className='text-xs sm:text-sm'>
                    {displayQuiz.attemptsCount} vyplnění
                  </span>
                </span>

                <span className='flex items-center gap-1.5 whitespace-nowrap'>
                  <HelpCircle size={15} className='text-secondary' />
                  <span className='text-xs sm:text-sm'>
                    {displayQuiz.questions.length} otázek
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {mode === 'lecturer' && hasChanges && (
              <span className='text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full'>
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

            <button className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
              {isExpanded ? (
                <ChevronUp
                  size={22}
                  strokeWidth={3}
                  className='text-secondary'
                />
              ) : (
                <ChevronDown
                  size={22}
                  strokeWidth={3}
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
                <div>
                  {/* Question Header */}
                  {/* Question Header */}
                  <div className='flex flex-col md:flex-row md:items-center gap-3 mb-4'>
                    {/* První řádek (mobile) / Levá část (desktop) */}
                    <div className='flex items-center gap-3 flex-1'>
                      <span className='font-bold text-background text-base bg-primary w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center shrink-0'>
                        {qIndex + 1}
                      </span>

                      {mode === 'lecturer' ? (
                        <Textarea
                          variant={'ghost'}
                          value={question.question}
                          onChange={(e) => {
                            e.preventDefault()
                            updateQuestionText(qIndex, e.target.value)
                          }}
                          className='text-sm sm:text-base font-medium flex-1'
                          placeholder='Zadejte otázku'
                        />
                      ) : (
                        <Label size={'md'} className='flex-1'>
                          {question.question}
                        </Label>
                      )}
                    </div>

                    {/* Druhý řádek (mobile) / Pravá část (desktop) */}
                    {mode === 'lecturer' && (
                      <div className='flex items-center gap-3 pl-9 md:pl-0'>
                        <Label size='sm' className='text-gray-600 shrink-0'>
                          Typ:
                        </Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: QuestionType) =>
                            updateQuestionType(qIndex, value)
                          }
                        >
                          <SelectTrigger className='w-full md:w-40'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='singleChoice'>
                              Jedna správná
                            </SelectItem>
                            <SelectItem value='multipleChoice'>
                              Více správných
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <EditBtn
                          onClick={() => removeQuestion(qIndex)}
                          type='delete'
                        />
                      </div>
                    )}

                    {mode === 'user' &&
                      userState?.status === 'submitted' &&
                      (userState.results?.correctPerQuestion[qIndex] ? (
                        <Check
                          className='text-secondary'
                          size={22}
                          strokeWidth={3}
                        />
                      ) : (
                        <X
                          className='text-destructive'
                          size={22}
                          strokeWidth={3}
                        />
                      ))}
                  </div>

                  {/* Options */}
                  <div className='space-y-2.5 lg:pl-10'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4'>
                      {question.options.map((option, optIndex) => {
                        const isCorrect =
                          question.type === 'singleChoice'
                            ? question.correctIndex === optIndex
                            : (question.correctIndices || []).includes(optIndex)

                        // User mode logic
                        const answer = question.uuid
                          ? (
                              userState?.answers as unknown as Record<
                                string,
                                QuizAnswer
                              >
                            )?.[question.uuid]
                          : undefined
                        const isSelected =
                          question.type === 'singleChoice'
                            ? answer?.selectedIndex === optIndex
                            : (answer?.selectedIndices ?? []).includes(optIndex)
                        const isSubmitted = userState?.status === 'submitted'
                        const showCorrect = userState?.showCorrect

                        if (mode === 'lecturer') {
                          return (
                            <div
                              key={optIndex}
                              className={cn(
                                'flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg transition-all border-2',
                                isCorrect
                                  ? 'border-secondary bg-secondary/10'
                                  : 'border-gray-200 bg-gray-50',
                              )}
                            >
                              <Checkbox
                                variant={
                                  question.type === 'singleChoice'
                                    ? 'radio'
                                    : 'checkbox'
                                }
                                checked={isCorrect}
                                onCheckedChange={() =>
                                  toggleCorrectAnswer(qIndex, optIndex)
                                }
                              />

                              <Textarea
                                variant={'ghost'}
                                value={option}
                                onChange={(e) =>
                                  updateOption(qIndex, optIndex, e.target.value)
                                }
                                placeholder='Zadejte možnost'
                                className='text-xs md:text-sm'
                              />

                              {question.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(qIndex, optIndex)}
                                  className='shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors'
                                  title='Smazat možnost'
                                >
                                  <X size={18} className='text-destructive' />
                                </button>
                              )}
                            </div>
                          )
                        } else {
                          return (
                            <Label
                              key={optIndex}
                              className={cn(
                                'flex items-center gap-3 p-2.5 md:p-3.5 rounded-lg transition-all border border-gray-200 bg-gray-100',
                                !isSubmitted &&
                                  'cursor-pointer hover:bg-primary/20 hover:border-gray-300',
                                isSelected &&
                                  !showCorrect &&
                                  !isSubmitted &&
                                  'bg-primary/10',
                                isSelected &&
                                  isSubmitted &&
                                  !showCorrect &&
                                  'bg-gray-200',
                                isSelected &&
                                  isCorrect &&
                                  showCorrect &&
                                  'bg-secondary/40',
                                isSelected &&
                                  !isCorrect &&
                                  isSubmitted &&
                                  showCorrect &&
                                  'bg-destructive/30',
                                !isSelected &&
                                  isCorrect &&
                                  showCorrect &&
                                  'border-secondary border-2',
                              )}
                            >
                              <Checkbox
                                variant={
                                  question.type === 'singleChoice'
                                    ? 'radio'
                                    : 'checkbox'
                                }
                                checked={isSelected}
                                disabled={isSubmitted}
                                onCheckedChange={() => {
                                  if (question.uuid && onAnswerChange) {
                                    if (question.type === 'singleChoice') {
                                      onAnswerChange(question.uuid, {
                                        selectedIndex: optIndex,
                                      })
                                    } else {
                                      const current =
                                        answer?.selectedIndices || []
                                      const newIndices = current.includes(
                                        optIndex,
                                      )
                                        ? current.filter((i) => i !== optIndex)
                                        : [...current, optIndex]
                                      onAnswerChange(question.uuid, {
                                        selectedIndices: newIndices,
                                      })
                                    }
                                  }
                                }}
                              />
                              <span className='text-sm font-medium text-foreground'>
                                {option}
                              </span>
                            </Label>
                          )
                        }
                      })}
                    </div>

                    {mode === 'lecturer' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => addOption(qIndex)}
                        className='w-full md:w-auto'
                      >
                        <Plus size={16} />
                        Přidat možnost
                      </Button>
                    )}
                  </div>
                </div>

                {qIndex < displayQuiz.questions.length - 1 && (
                  <hr className='border-b border mt-2 border-gray-100' />
                )}
              </Fragment>
            )
          })}

          {/* Lecturer: Add question Button */}
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
                    size='primary'
                    className='w-fit'
                    disabled={isSubmitDisabled || isSubmitting}
                    onClick={onSubmit}
                  >
                    <Play size={20} />
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
                  size='primary'
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className='min-w-50'
                >
                  <Save size={20} />
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
