import { useEffect, useState } from 'react';
import { 
  Link2, Download, 
   CheckCircle, Clock, BookOpen, Sparkles, ChevronLeft ,
  ChevronDown, ChevronUp, Play, Calendar, Edit, Bell, Info, Check 
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { colorStyles, colors } from '@/lib/constants';
import type { ColorVariant } from '@/lib/constants';
// import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
// import type { Course } from '@/lib/types';
import { CourseDetailSchema, type CourseDetail, type Quiz } from '@/lib/schemas';
import { getCourseById } from '@/api/queries';
import { useNavigate, useParams } from 'react-router';
import { Label } from '@/components/ui/label';
import QuizesSection from './QuizesSection';

const CoursePage = () => {
  const [courseData, setCourseData] = useState<CourseDetail  | null>(null);
  const navigate = useNavigate();

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

  const styles = {
    sectionTitle: 'text-2xl md:text-3xl font-bold text-primary',
    iconBox: 'p-2 bg-primary rounded-xl shadow-lg',
    badge: 'text-sm font-bold text-foreground',
    statBadge: 'flex items-center gap-2 px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105',
    input: 'w-5 h-5 text-primary accent-primary',
  };

  // Helper functions

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

  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>

      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pb-8 space-y-8'>

    <section>
      <div className="bg-background rounded-xl border border-gray-100 overflow-hidden relative">
        <div className="bg-linear-to-r from-secondary to-accent-teal-light h-2" />


        <div className="px-5 md:px-6 py-5 gap-3 flex flex-col">
          <div className='flex md:flex-row gap-2 items-center'>
            <Button variant={'grid'}
           className={cn(
              'bg-linear-to-br px-3 py-1 h-8',
              colorStyles.bg['accent-teal-light'],
              colorStyles.text['accent-teal-light']
            )}
             onClick={() => navigate(-1)}>
              <ChevronLeft size={16}/>
                <span>Zpět</span>
            </Button>
            <Label className='mb-0' size="lg">{courseData?.name}</Label>
           </div>
          {courseData?.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-2">
              {courseData.description}
            </p>
          )}
        
        </div>
      </div>
    </section>

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
                              <Popover>
                                <PopoverTrigger>
                            <Button variant={'ghost'}>
                              <Info size={16} />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent side="right" align="center" sideOffset={4} alignOffset={0} avoidCollisions>
                                  {material.description}
                              </PopoverContent>
                              </Popover>
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
                            'bg-linear-to-br w-25',
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
                            'bg-linear-to-br w-25',
                            colorStyles.bg['accent-teal-light'],
                            colorStyles.text['accent-teal-light']
                          )}>
                        <Link2 size={14} />
                        <span>Otevřít</span>
                      </Button>
                    )}
                  </div>


                </div>
              );
            })}
          </div>
        </section>


        {/* Quizzes Section */}
        <QuizesSection styles={styles.input} courseData={courseData}/>

        {/* Feed Section */}
        <section>
            <Label size="lg">Oznámení a novinky</Label>

          <div className='space-y-3'>
            {courseData?.feed.map((item) => {
              
              return (
                <div
                  key={item.uuid}
                  className='bg-background rounded-xl transition-all duration-300 p-5 border border-gray-100 hover:border-gray-200'
                >
                  <div className='flex items-start gap-4'>
                    <div className={cn('p-2.5 rounded-lg shrink-0', colorStyles.iconBg['accent-teal-light'])}>
                      <Bell className={colorStyles.text['accent-teal-light']} size={22} />
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

