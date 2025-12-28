import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type CourseDetail, type QuizResults, type QuizAnswer, QuizSubmitResponseSchema, type QuizSubmitResponse, QuizAnswerSchema } from "@/lib/schemas";
import { useState, useEffect, startTransition, Fragment } from "react";
import { Clock, CheckCircle, ChevronUp, ChevronDown, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuiz } from "@/api/queries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


type QuizesSectionProps ={
  courseData?: CourseDetail  | null,
}
type QuizState = {
    answers: Record<string, QuizAnswer>,
    status: 'idle' | 'submitting' | 'submitted' | 'error',
    results?: QuizSubmitResponse,
    error?: string
}
type QuizStateById = Record<string, QuizState>;

const QuizesSection = ({courseData}: QuizesSectionProps) => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [quizState, setQuizState]= useState<QuizStateById>({});

  useEffect(() => {
    if (!courseData?.quizzes) return;

    const initialResults: QuizStateById = {};
    courseData?.quizzes.forEach(quiz => {
      if (!quiz.uuid) return;

      initialResults[quiz.uuid] = {
        status: 'idle',
        answers: {},
      }
      
    });
    if (Object.keys(initialResults).length === 0) return;

    startTransition(() => {
      setQuizState(prev => (Object.keys(prev).length ? prev : initialResults));
    });
  }, [courseData]);

    const toggleQuiz = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const handleSingleChoice = (quizId: string, questionId: string, index: number) => {
    setQuizState(prev => ({
      ...prev,
      [quizId]:{
        ...prev[quizId],
        answers:{
          ...prev[quizId].answers,
          [questionId]: {
            uuid: questionId,
            selectedIndex: index
          } 
        }
      }
        
    }))
  }

  const handleMultipleChoice = (quizId: string, questionId: string, index: number) => {
    setQuizState(prev => {
      const current = prev[quizId]?.answers[questionId]?.selectedIndices ?? [];

      const updated = current.includes(index)
        ? current.filter(i => i !== index)
        : [...current, index];

      return {
      ...prev,
      [quizId]:{
        ...prev[quizId],
        answers:{
          ...prev[quizId].answers, 
          [questionId]: {
            uuid: questionId,
            selectedIndices: updated
          } 
        }
      }
      };
    });
  }

  const queryClient = useQueryClient();

  const queryMutation = useMutation<QuizSubmitResponse, Error, { courseId: string; quizId: string; answers: QuizAnswer[] }, { previousData?: CourseDetail | undefined }>({

    mutationFn: async ({ courseId, quizId, answers }) => {
      
      const raw = await submitQuiz(courseId, quizId , {answers});

      const parsed = QuizSubmitResponseSchema.safeParse(raw);

      if (!parsed.success){
          console.error("quizResponseSubmit schema validation failed", parsed.error);
          throw new Error("Invalid data to submit");
      }

      setQuizState (prev => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        status: 'submitted',
        results: parsed.data
      }
    }))
      return parsed.data;
    },
    onMutate: ({courseId, quizId}) => {
      const previousData = queryClient.getQueryData<CourseDetail | undefined>(['course', courseId]);

      queryClient.setQueryData<CourseDetail | undefined>(['course', courseId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          quizzes: oldData.quizzes.map(q =>
            q.uuid === quizId
              ? { ...q, attemptsCount: (q.attemptsCount ?? 0) + 1 }
              : q
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.log('error submiting quiz ', err);
      queryClient.setQueryData(['course', variables.courseId], context?.previousData)
    },
    onSuccess: (data, variables) => {
      console.log('quiz submitted', data)
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] })
    },

  })


  const handleSubmit = async (quizId: string) => {

    const answers = Object.values(quizState[quizId].answers);

    queryMutation.mutate({
      courseId: courseData!.uuid, 
      quizId, 
      answers})
  }

  return (
        <section>

          <Label size="xl">Kvízy</Label>

          <div className='space-y-4'>
            {courseData?.quizzes?.map((quiz) => {
              const isExpanded = expandedQuiz === quiz.uuid;


              return (
                <div key={quiz.uuid} className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>

                  <div
                    className='p-5 cursor-pointer hover:bg-gray-50 transition-colors'
                    onClick={() => quiz.uuid && toggleQuiz(quiz.uuid)}>

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
                            <Label size={'md'}>{question.question}</Label>
                          </div>

                          <div className='space-y-2.5 pl-11'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                              {question.options.map((option, optIndex) => {
                                const answer = quizState[quiz.uuid!].answers[question.uuid!];

                                const isSelected = question.type === 'singleChoice'
                                  ? answer?.selectedIndex === optIndex
                                  : (answer?.selectedIndices ?? []).includes(optIndex);
                                const isSubmitted = quizState[quiz.uuid!].status === 'submitted';
                                const isCorrectOption = isSubmitted && (question.type ==='singleChoice' ? 
                                        question.correctIndex === optIndex : 
                                        (question.correctIndices as number[]).includes(optIndex)
                                      )
                                return (
                                  <Label
                                    key={optIndex}
                                    className={cn(
                                      'flex items-center gap-3 p-3.5 rounded-lg transition-all border border-gray-200',
                                      !isSubmitted && 'cursor-pointer hover:bg-primary/20 hover:border-gray-300',
                                      isSelected ? 'bg-primary/10' : 'bg-gray-100',
                                      isSelected && isCorrectOption && 'bg-secondary/40',
                                      isSelected && !isCorrectOption && isSubmitted && 'bg-destructive/30',
                                      !isSelected && isCorrectOption && 'border-secondary border-2'
                                    )}
                                  >
                                    <input
                                      type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                                      name={question.uuid}
                                      checked={isSelected}
                                      disabled={isSubmitted}
                                      className='w-5 h-5 text-primary accent-primary'
                                      onChange={() => {
                                        if (question.uuid){
                                        if (question.type === 'singleChoice') {
                                          handleSingleChoice(quiz.uuid!, question.uuid, optIndex);
                                        } else {
                                          handleMultipleChoice(quiz.uuid!, question.uuid, optIndex);
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
                          <hr className='border-b border mt-6 mb-4 border-gray-100'></hr>
                        </Fragment>
                      ))}
                      <div className="flex flex-col mx-11">
                      {queryMutation.isError && <Label size={'md'} variant={'error'} className="mb-3">{queryMutation.error.message as string}</Label>}
                      <div className="flex flex-row items-center justify-between">
                      <Button variant='primary' size='primary' className="w-fit"
                      disabled={(queryMutation.variables?.quizId === quiz.uuid && queryMutation.isPending) || quizState[quiz.uuid!]?.status === 'submitted'}
                      onClick={() =>{handleSubmit(quiz.uuid!)}
                    }>
                        <Play size={20} />
                        Odeslat odpovědi
                      </Button>

                      {quizState[quiz.uuid!]?.status === 'submitted' && 
                      <Label className="text-primary flex items-center gap-3" size={'lg'}>
                        <CheckCircle size={20} />
                        {quizState[quiz.uuid!].results?.score}/
                        {quizState[quiz.uuid!].results?.maxScore}
                      </Label>}
                      </div>
                    </div>
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
