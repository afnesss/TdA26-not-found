import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CourseDetail } from "@/lib/schemas";
import type { QuizResults } from "@/lib/schemas";
import { useState, useEffect, startTransition, Fragment } from "react";
import { Clock, CheckCircle, ChevronUp, ChevronDown, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizesSectionProps ={
  courseData: CourseDetail  | null,
}

const QuizesSection = ({courseData}: QuizesSectionProps) => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [quizResults, setQuizResults] = useState<QuizResults>({});


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
  
  const handleAnswer = (questionId: string, answer: number | number[]) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
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
                                const isSelected = question.type === 'singleChoice'?
                                selectedAnswers[question.uuid!] === optIndex:
                                (selectedAnswers[question.uuid!] as number[] || []).includes(optIndex);
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
                                        if (question.type === 'singleChoice') {
                                          if (question.uuid) handleAnswer(question.uuid, optIndex);
                                        } else {
                                          if (question.uuid) {
                                            const current = (selectedAnswers[question.uuid] as number[]) || [];
                                            const newValue = current.includes(optIndex)
                                              ? current.filter(i => i !== optIndex)
                                              : [...current, optIndex];
                                            handleAnswer(question.uuid, newValue);
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

                      <Button variant='primary' size='primary' className='ml-11' onClick={() =>
                      setQuizResults(prev => ({
                        ...prev,
                        [quiz.uuid!]: {
                          ...(prev[quiz.uuid!] ?? { submitted: false, answers: {} }),
                          submitted: true,
                        },
                      }))
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
