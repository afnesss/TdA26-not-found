import { useState } from 'react';
import { 
  FileText, Link2, Download, 
  Trophy, CheckCircle, Clock, MessageSquare, 
  ChevronDown, ChevronUp, Play, Calendar, Edit, Bell, Target, BookCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { colorStyles, colors } from '@/lib/constants';
import type { ColorVariant } from '@/lib/constants';

const CoursePage = () => {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});

  // Mock data based on API structure
  const courseData = {
    uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "Kritické myšlení pro začátečníky",
    description: "Naučte se základy kritického myšlení a logické argumentace. Tento kurz vás provede klíčovými koncepty a technikami, které můžete aplikovat v každodenním životě.",
    materials: [
      {
        uuid: "mat-2",
        type: "url",
        name: "Interaktivní cvičení",
        description: "Online nástroj pro procvičování logických úloh",
        url: "https://example.com/exercises",
        faviconUrl: "https://example.com/favicon.ico"
      },
      {
        uuid: "mat-3",
        type: "file",
        name: "Pracovní listy.docx",
        description: "Soubor s praktickými úkoly",
        fileUrl: "#",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sizeBytes: 1024000
      }
    ],
    quizzes: [
      {
        uuid: "quiz-1",
        title: "Základy logického myšlení",
        attemptsCount: 3,
        questions: [
          {
            uuid: "q1",
            type: "singleChoice",
            question: "Co je základem kritického myšlení?",
            options: [
              "Přijímání všech informací bez otázek",
              "Analýza a hodnocení informací",
              "Rychlé rozhodování",
              "Spoléhání se na emoce"
            ],
            correctIndex: 1
          },
          {
            uuid: "q2",
            type: "multipleChoice",
            question: "Které z následujících jsou součástí kritického myšlení? (Vyberte všechny správné)",
            options: [
              "Logická analýza long text ledujících jsou součástí kritického myšlení? (Vyberte všechny sp",
              "Ověřování zdrojů",
              "Subjektivní hodnocení",
              "Rozpoznávání předsudků"
            ],
            correctIndices: [0, 1, 3]
          }
        ]
      },
      {
        uuid: "quiz-2",
        title: "Praktická aplikace",
        attemptsCount: 2,
        questions: [
          {
            uuid: "q3",
            type: "singleChoice",
            question: "Jak nejlépe vyhodnotit věrohodnost zdroje?",
            options: [
              "Podle počtu lajků",
              "Podle autority a důkazů",
              "Podle délky textu",
              "Podle osobního souhlasu"
            ],
            correctIndex: 1
          }
        ]
      }
    ],
    feed: [
      {
        uuid: "feed-1",
        type: "manual",
        message: "Vítejte v kurzu! Začněte prostudováním materiálů v sekci Materiály.",
        edited: false,
        createdAt: "2024-11-15T10:00:00Z",
        updatedAt: "2024-11-15T10:00:00Z"
      },
      {
        uuid: "feed-2",
        type: "manual",
        message: "Nové pracovní listy byly přidány. Nezapomeňte si je stáhnout!",
        edited: true,
        createdAt: "2024-11-20T14:30:00Z",
        updatedAt: "2024-11-21T09:15:00Z"
      },
      {
        uuid: "feed-3",
        type: "manual",
        message: "Připomenutí: Dokončete kvízy před koncem týdne pro získání certifikátu.",
        edited: false,
        createdAt: "2024-11-25T16:00:00Z",
        updatedAt: "2024-11-25T16:00:00Z"
      }
    ]
  };

  // Component style variants
  const styles = {
    card: 'rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer',
    cardHover: 'hover:-translate-y-1',
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
          <div className='flex items-center gap-3 mb-5'>
            <h2 className={styles.sectionTitle}>Studijní materiály</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {courseData.materials.map((material, index) => {
              const color = getColorVariant(index);

              return (
                <div
                  key={material.uuid}
                  className={cn(
                    styles.card,
                    styles.cardHover,
                    'bg-background group'
                  )}
                >
                  {/* <div className={cn('h-2 bg-linear-to-r', colorStyles.gradient[color])} /> */}
                  
                  <div className='p-5 relative overflow-hidden h-full'>
                    
                    <div className='relative z-10'>
                      <div className='flex-1 inline-flex items-start gap-3 mb-3'>
                        <div className='text-4xl drop-shadow-lg'>
                          {material.type === 'file' ? getFileIcon(material.mimeType) : '🔗'}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1 text-lg'>
                            {material.name}
                          </h3>
                          <p className='text-sm text-gray-600 line-clamp-2'>
                            {material.description}
                          </p>
                        </div>
                      </div>

                      {material.type === 'file' ? (
                        <div className='flex items-center justify-between mt-4 pt-4 border-t border-secondary/30'>
                          <span className={`text-xs font-semibold ${colorStyles.iconBg[color]} text-gray-600 px-3 py-1 rounded-full`}>
                            {formatFileSize(material.sizeBytes)}
                          </span>
                            <Button variant={'grid'} size={'md'} className={cn(
                            'bg-linear-to-br',
                            colorStyles.bg[color],
                            colorStyles.text[color]
                          )}>
                            <Download size={16} />
                            <span>Stáhnout</span>
                          </Button>
                        </div>
                      ) : (
                        <div className='mt-4 pt-4 border-t border-secondary/30'>
                          <Button size={'md'} variant={'grid'} className={cn(
                            'w-full justify-center bg-linear-to-br',
                            colorStyles.bg[color],
                            colorStyles.text[color]
                          )}>
                            <Link2 size={16} />
                            <span>Otevřít odkaz</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quizzes Section */}
        <section>
          <div className='flex items-center gap-3 mb-5'>
            <h2 className={styles.sectionTitle}>Kvízy</h2>
          </div>

          <div className='space-y-4'>
            {courseData.quizzes.map((quiz, quizIndex) => {
              const isExpanded = expandedQuiz === quiz.uuid;
              // const color = getColorVariant(0);
              // const QuizIcon = quizIndex === 0 ? Trophy : quizIndex === 1 ? Target : BookCheck;

              return (
                <div key={quiz.uuid} className='bg-background rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
                  {/* Quiz Header */}
                  {/* <div className={cn('h-1.5 bg-linear-to-r', colorStyles.gradient[color])} /> */}
                  <div
                    className='p-5 cursor-pointer hover:bg-gray-50 transition-colors'
                    onClick={() => toggleQuiz(quiz.uuid)}
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex items-center gap-4 flex-1'>
                        {/* <div className={cn('p-3 rounded-xl', colorStyles.iconBg['secondary'])}>
                          <QuizIcon className={colorStyles.text['secondary']} size={24} />
                        </div> */}
                        <div className='flex-1'>
                          <h3 className='text-lg font-bold text-foreground mb-2'>{quiz.title}</h3>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <span className='flex items-center gap-1.5'>
                              <Clock size={16} className='text-primary' />
                              <span className='font-medium'>{quiz.attemptsCount} pokusů</span>
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <CheckCircle size={16} className='text-accent-teal' />
                              <span className='font-medium'>{quiz.questions.length} otázek</span>
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
                          <div key={question.uuid} className='flex items-center gap-3 mb-4 '>
                            
                            <span className='font-bold text-background text-base bg-primary min-w-8 h-8 rounded-full flex items-center justify-center shrink-0'>
                              {qIndex + 1}
                            </span>
                            <p className='font-semibold text-foreground text-base'>{question.question}</p>
                          </div>

                          <div className='space-y-2.5 pl-11'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
                            {question.options.map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className='flex items-center gap-3 p-3.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-primary/20 hover:border-gray-300 transition-all border border-gray-200'
                              >
                                <input
                                  type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                                  name={question.uuid}
                                  className={styles.input}
                                  onChange={() => {
                                    if (question.type === 'singleChoice') {
                                      handleAnswer(question.uuid, optIndex);
                                    } else {
                                      const current = (selectedAnswers[question.uuid] as number[]) || [];
                                      const newValue = current.includes(optIndex)
                                        ? current.filter(i => i !== optIndex)
                                        : [...current, optIndex];
                                      handleAnswer(question.uuid, newValue);
                                    }
                                  }}
                                />
                                <span className='text-sm font-medium text-foreground'>{option}</span>
                              </label>
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
          <div className='flex items-center gap-3 mb-5'>
            <h2 className={styles.sectionTitle}>Oznámení a novinky</h2>
          </div>

          <div className='space-y-3'>
            {courseData.feed.map((item, index) => {
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

