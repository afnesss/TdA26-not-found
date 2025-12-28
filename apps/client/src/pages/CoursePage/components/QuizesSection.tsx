import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type CourseDetail, type QuizResults, type QuizAnswer, QuizSubmitResponseSchema, type QuizSubmitResponse } from "@/lib/schemas";
import { useState, useEffect, startTransition, Fragment } from "react";
import { Clock, CheckCircle, ChevronUp, ChevronDown, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuiz } from "@/api/queries";

type QuizesSectionProps ={
  courseData: CourseDetail  | null,
}

const QuizesSection = ({courseData}: QuizesSectionProps) => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, QuizAnswer>>({});
  const [quizResults, setQuizResults] = useState<QuizResults>({});
  const [quizResultsResp, setQuizResultsResp] = useState<QuizSubmitResponse[]>([]);//if includes response data with the right id -> show results f.e. 3/5

  useEffect(() => {
    if (!courseData?.quizzes) return;

    const initialResults: QuizResults = {};
    courseData?.quizzes.forEach(quiz => {
      if (quiz.uuid){
        const correctAnswers: Record<string,  {correctAnswer: number | number[]}> = {};
        quiz.questions.forEach(question => {
          correctAnswers[question.uuid!] = {
            correctAnswer: question.type === 'singleChoice'?
            question.correctIndex :
            question.correctIndices
          }
        });
        initialResults[quiz.uuid] = {
          submitted: false,
          answers: correctAnswers
        }
      }
    });
    // Only set quiz results if there is something to set and avoid unnecessary updates
    if (Object.keys(initialResults).length === 0) return;

    startTransition(() => {
      setQuizResults(prev => (Object.keys(prev).length ? prev : initialResults));
    });
  }, [courseData]);

    const toggleQuiz = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const handleSingleChoice = (questionId: string, index: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]:{
        uuid: questionId,
        selectedIndex: index
      }
        
    }))
  }

  const handleMultipleChoice = (questionId: string, index: number) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId].selectedIndices;

      const updated = current?.includes(index)?
        current.filter(i => i !== index) :
        [...(current ?? []), index];

      return {
        ...prev,
        [questionId]: {
          uuid: questionId,
          selectedIndices: updated
        }
      }
    })
  }

  const handleSubmit = async (courseId: string, quizId: string) => {
    setQuizResults(prev => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] ?? { submitted: false, answers: {} }),
        submitted: true,
      },
    }));
    const answers = Object.values(selectedAnswers);
    const raw = await submitQuiz(courseId, quizId ?? '', {answers});

    if (!raw) {
      throw new Error("quiz to submit not found");
    }

    const parsed = QuizSubmitResponseSchema.safeParse(raw);

    if (!parsed.success){
        console.error("quizResponseSubmit schema validation failed", parsed.error);
        throw new Error("Invalid data to submit");
    }


  }

  return (
        <section>

          <Label size="lg">Kvízy</Label>

          <div className='space-y-4'>
            {courseData?.quizzes?.map((quiz) => {
              const isExpanded = expandedQuiz === quiz.uuid;


              return (
                <div key={quiz.uuid} className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>

                  <div
                    className='p-5 cursor-pointer hover:bg-gray-50 transition-colors'
                    onClick={() => quiz.uuid && toggleQuiz(quiz.uuid)}
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex items-center gap-4 flex-1'>

                        <div className='flex-1'>
                          <Label className='mb-3' variant={'name'}>{quiz.title}</Label>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <span className='flex items-center gap-1.5'>
                              <Clock size={16} className='text-primary' />
                              <span className='font-medium'>{quiz.attemptsCount ?? 0} vyplnění</span>
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <CheckCircle size={16} className='text-accent-teal' />
                              <span className='font-medium'>{quiz.questions?.length} otázek</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
                        {isExpanded ? 
                          <ChevronUp size={24} className='text-accent-teal' /> : 
                          <ChevronDown size={24} className='text-accent-teal' />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className='px-5 pb-5 space-y-4 border-t border-gray-100 pt-5 bg-gray-50/50'>
                      {quiz.questions.map((question, qIndex) => (

                        <Fragment key={question.uuid ?? qIndex}>
                          <div className='flex items-center gap-3 mb-4 '>
                            
                            <span className='font-bold text-background text-base bg-primary min-w-8 h-8 rounded-full flex items-center justify-center shrink-0'>
                              {qIndex + 1}
                            </span>
                            <p className='font-semibold text-foreground text-base'>{question.question}</p>
                          </div>

                          <div className='space-y-2.5 pl-11'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                              {question.options.map((option, optIndex) => {
                                const answer = selectedAnswers[question.uuid!];

                                const isSelected = question.type === 'singleChoice'?
                                answer.selectedIndex === optIndex:
                                (answer.selectedIndices as number[] || []).includes(optIndex);
                                const isQuizSubmitted = quizResults[quiz.uuid!]?.submitted;
                                const isCorrectOption = isQuizSubmitted && (question.type ==='singleChoice' ? 
                                        quizResults[quiz.uuid!].answers[question.uuid!].correctAnswer === optIndex : 
                                        (quizResults[quiz.uuid!].answers[question.uuid!].correctAnswer as number[]).includes(optIndex)
                                      )
                                return (
                                  <Label
                                    key={optIndex}
                                    className={cn(
                                      'flex items-center gap-3 p-3.5 rounded-lg transition-all border border-gray-200',
                                      !isQuizSubmitted && 'cursor-pointer hover:bg-primary/20 hover:border-gray-300',
                                      isSelected ? 'bg-primary/10' : 'bg-gray-100',
                                      isSelected && isCorrectOption && 'bg-secondary/40',
                                      isSelected && !isCorrectOption && isQuizSubmitted && 'bg-destructive/40',
                                      !isSelected && isCorrectOption && 'border-secondary border-2'
                                    )}
                                  >
                                    <input
                                      type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                                      name={question.uuid}
                                      className='w-5 h-5 text-primary accent-primary'
                                      onChange={() => {
                                        if (question.uuid){
                                        if (question.type === 'singleChoice') {
                                          handleSingleChoice(question.uuid, optIndex);
                                        } else {
                                          handleMultipleChoice(question.uuid, optIndex);
                                          }
                                        
                                        }

                                      }}
                                    />
                                    <div className='flex justify-between w-full'>
                                    <span className='text-sm font-medium text-foreground'>{option}</span>
                                    {!isSelected && isCorrectOption && <Check className='text-secondary self-end' size={20}/>}
                                    </div>

                                  </Label>
                                )
                              })}
                          </div>
                        </div>
                          <hr className='border-b border my-6 border-gray-100'></hr>
                        </Fragment>
                      ))}

                      <Button variant='primary' size='primary' className='ml-11' 
                      onClick={() =>{handleSubmit(courseData.uuid, quiz.uuid!)}
                    }>
                        <Play size={20} />
                        Odeslat odpovědi
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
  )
}

export default QuizesSection
