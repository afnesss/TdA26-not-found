import { useEffect, useState } from 'react';
import { 
  Link2, Download, 
   CheckCircle, Clock, 
  ChevronDown, ChevronUp, Play, Calendar, Edit, Bell, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { colorStyles, colors } from '@/lib/constants';
import type { ColorVariant } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
// import type { Course } from '@/lib/types';
import { CourseDetailSchema, type CourseDetail } from '@/lib/schemas';
import { getCourseById } from '@/api/queries';
import { useParams } from 'react-router';
import { Label } from '@/components/ui/label';

const CoursePage = () => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [courseData, setCourseData] = useState<CourseDetail  | null>(null);
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>('');

  const {id} = useParams<{ id: string }>();
  console.log("Course id param:", id);
  useEffect ( () => {

    const load = async () => {
      try {
        const raw = await getCourseById(id!);
        if (!raw) {
          throw new Error("Course not found");
        }
        const parsed = CourseDetailSchema.safeParse(raw);

        if (!parsed.success) {
          console.error("Course schema validation failed", parsed.error);
          throw new Error("Invalid course data");
        }

        setCourseData(parsed.data);
      } catch (err) {
        console.error(err);
      }
    };

  load();
  }, [id])

    useEffect(() => {
      console.log(courseData);
    }, [courseData]);

  // Component style variants
  const styles = {
    sectionTitle: 'text-2xl md:text-3xl font-bold text-primary',
    iconBox: 'p-2 bg-primary rounded-xl shadow-lg',
    badge: 'text-sm font-bold text-foreground',
    statBadge: 'flex items-center gap-2 px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105',
    input: 'w-5 h-5 text-primary accent-primary',
  };

  // Helper functions
  const getColorVariant = (index: number): ColorVariant => colors[index % 3];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleQuiz = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const handleAnswer = (questionId: string, answer: number | number[]) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>

      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pb-8 space-y-8'>
        {/* Materials Section */}
        <section>

          <Label size='lg'>Studijní materiály</Label>

          <div className='space-y-3'>
            {courseData?.materials.map((material, index) => {

          return (
                <div
                  key={material.uuid}
                  className='bg-background rounded-xl transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200'
                >
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className={' rounded-lg shrink-0'}>
                        <div className='text-xl'>
                          {material.type === "file" ? (
                            getFileIcon(material.mimeType)
                          ) : material.faviconUrl ? (
                            <img
                              src={material.faviconUrl}
                              alt=""
                              className="w-6 h-6 rounded"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            "🔗"
                          )}
                        </div>
                      </div>
                      
                      <div className='flex-1 group '>
                        <div className='flex items-center gap-2'>
                          <Label>
                            {material.name}
                          </Label>
                          {material.description && (
                            <div className='relative w-fit'>
                            <button className='shrink-0 text-gray-400 hover:text-primary transition-colors'
                            onMouseEnter={() => setHoveredMaterial(material.uuid ?? null)}
                            onMouseLeave={() => setHoveredMaterial(null)}>
                              <Info size={16} />

                            </button>
                             {hoveredMaterial === material.uuid && (
                                <div className='absolute left-full ml-2 top-1/2 w-max -translate-y-1/2 z-10 bg-background border border-gray-200 rounded-lg shadow-xl p-3 text-sm text-gray-700  max-w-xl leading-relaxed '>
                                  {material.description}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                        {material.type === 'file' && (
                          <span className='text-xs text-gray-600 font-medium'>
                            {formatFileSize(material.sizeBytes)}
                          </span>
                        )}

                      </div>
                    </div>

                    {material.type === 'file' ? (
                      <Button 
                          variant={'grid'} size={'grid'}
                          className={cn(
                            'bg-linear-to-br',
                            colorStyles.bg['accent-teal'],
                            colorStyles.text['accent-teal']
                          )}>
                        <Download size={14} />
                        <span>Stáhnout</span>
                      </Button>
                    ) : (
                    <Button
                          variant={'grid'} size={'grid'}
                          className={cn(
                            'bg-linear-to-br',
                            colorStyles.bg['accent-teal-light'],
                            colorStyles.text['accent-teal-light']
                          )}>
                        <Link2 size={14} />
                        <span>Otevřít</span>
                      </Button>
                    )}
                  </div>

                  {/* Popover for description */}

                </div>
              );
            })}
          </div>
        </section>


        {/* Quizzes Section */}
        <section>

          <Label size="lg">Kvízy</Label>

          <div className='space-y-4'>
            {courseData?.quizzes.map((quiz) => {
              const isExpanded = expandedQuiz === quiz.uuid;


              return (
                <div key={quiz.uuid} className='bg-background group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
                  {/* Quiz Header */}
                  {/* <div className={cn('h-1.5 bg-linear-to-r', colorStyles.gradient[color])} /> */}
                  <div
                    className='p-5 cursor-pointer hover:bg-gray-50 transition-colors'
                    onClick={() => quiz.uuid && toggleQuiz(quiz.uuid)}
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex items-center gap-4 flex-1'>
                        {/* <div className={cn('p-3 rounded-xl', colorStyles.iconBg['secondary'])}>
                          <QuizIcon className={colorStyles.text['secondary']} size={24} />
                        </div> */}
                        <div className='flex-1'>
                          <Label className='mb-3' variant={'name'}>{quiz.title}</Label>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <span className='flex items-center gap-1.5'>
                              <Clock size={16} className='text-primary' />
                              <span className='font-medium'>{quiz.attemptsCount ?? 0} pokusů</span>
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <CheckCircle size={16} className='text-accent-teal' />
                              <span className='font-medium'>{quiz.questions?.length} otázek</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                        {isExpanded ? 
                          <ChevronUp size={24} className='text-primary' /> : 
                          <ChevronDown size={24} className='text-primary' />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className='px-5 pb-5 space-y-4 border-t border-gray-100 pt-5 bg-gray-50/50'>
                      {quiz.questions.map((question, qIndex) => (
                        // <div key={question.uuid} className='bg-background'>
                        <>
                          <div key={question.uuid ?? qIndex} className='flex items-center gap-3 mb-4 '>
                            
                            <span className='font-bold text-background text-base bg-primary min-w-8 h-8 rounded-full flex items-center justify-center shrink-0'>
                              {qIndex + 1}
                            </span>
                            <p className='font-semibold text-foreground text-base'>{question.question}</p>
                          </div>

                          <div className='space-y-2.5 pl-11'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                            {question.options.map((option, optIndex) => (
                              <Label
                                key={optIndex}
                                className='flex items-center gap-3 p-3.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-primary/20 hover:border-gray-300 transition-all border border-gray-200'
                              >
                                <input
                                  type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                                  name={question.uuid}
                                  className={styles.input}
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
                                <span className='text-sm font-medium text-foreground'>{option}</span>
                              </Label>
                            ))}
                          </div>
                          </div>
                          <hr className='border-b border my-6 border-gray-100'></hr>
                        {/* // </div> */}
                        </>
                      ))}

                      <Button variant='primary' size='primary' className='ml-11'>
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

        {/* Feed Section */}
        <section>
            <Label size="lg">Oznámení a novinky</Label>

          <div className='space-y-3'>
            {courseData?.feed.map((item, index) => {
              const color = getColorVariant(index);
              
              return (
                <div
                  key={item.uuid}
                  className='bg-background rounded-xl transition-all duration-300 p-5 border border-gray-100 hover:border-gray-200'
                >
                  {/* <div className={cn('h-1 bg-linear-to-r mb-4 rounded-full', colorStyles.gradient[color])} /> */}
                  <div className='flex items-start gap-4'>
                    <div className={cn('p-2.5 rounded-lg shrink-0', colorStyles.iconBg[color])}>
                      <Bell className={colorStyles.text[color]} size={22} />
                    </div>
                    
                    <div className='flex-1 min-w-0'>
                      <p className='text-foreground leading-relaxed text-base mb-3'>
                        {item.message}
                      </p>
                      
                      <div className='flex items-center gap-3 text-sm text-gray-600'>
                        <span className='flex items-center gap-1.5'>
                          <Calendar size={14} className='text-primary' />
                          <span className='font-medium'>{formatDate(item.createdAt)}</span>
                        </span>
                        
                        {item.edited && (
                          <span className='flex items-center gap-1.5 text-accent-teal font-medium bg-accent-teal/10 px-2 py-0.5 rounded-full'>
                            <Edit size={14} />
                            <span>Upraveno</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoursePage;

