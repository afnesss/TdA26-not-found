import { useEffect, useState } from 'react'
import { Search, Calendar, ArrowRight, BookOpen} from 'lucide-react'
import {Button} from '../../components/ui/button';
import HintPageText from '../../components/shared/HintPageText';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { colorStyles, colors, type FilterIds } from '@/lib/constants';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CardDate from './components/CardDate';
import { Label } from '@/components/ui/label';
import { getCourses } from '@/api/queries';
import { useNavigate } from 'react-router';
import type { CourseSummary } from '@/lib/schemas';
import LoadingSceleton from './components/LoadingSceleton';
import Filters from './components/Filters';
import EmptyStateComp from './components/EmptyStateComp';
import SearchBar from '@/components/shared/SearchBar';
import { useQuery } from '@tanstack/react-query';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterIds>('all');
  const [displayCount, setDisplayCount] = useState(9);
  const navigate = useNavigate();

  const {data: courses = [], isLoading, isError, refetch} = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  if (isLoading) {
    return <LoadingSceleton />
  }

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const dateKey = selectedFilter === 'newest' ? 'createdAt' :
    selectedFilter === 'updated' ? 'updatedAt': null;

    if (!dateKey) return 0;

    return new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime();
  });

  const hasMoreCourses = sortedCourses.length > displayCount;
  const displayedCourses = sortedCourses.slice(0, displayCount);
  const loadMoreCourses = () => {
    setDisplayCount(prev => prev+6);
    refetch();
  }

  const getTimeAgo = (date: string) => {
    const now = new Date().getTime();
    const updated = new Date(date).getTime();
    const diffInDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Dnes';
    if (diffInDays === 1) return 'Včera';
    if (diffInDays < 7) return `Před ${diffInDays} dny`;
    if (diffInDays < 30) return `Před ${Math.floor(diffInDays / 7)} týdny`;
    return `Před ${Math.floor(diffInDays / 30)} měsíci`;
  };

  return (
    <div className='h-full'>
      
      {/* Hero */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pt-3 pb-6'>
        <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-center items-center'>

          <HintPageText text="Dostupné kurzy" icon={BookOpen} spanText={searchQuery && displayedCourses.length.toString() || courses.length.toString()}/>
          
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
        </div>
      </div>

      <Filters selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}/>

      {/* Kurzy Grid */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 py-6 relative'>
        
          <>
            {/* Grid kurzů */}
            { displayedCourses &&
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
              {displayedCourses.map((course, index) => {
                const courseColor = colors[index % 3];

                return (
                  <Card key={course.uuid}>
                    <div className={`h-2 bg-linear-to-r ${colorStyles.gradient[courseColor]}`} />
                    
                    <div className='p-4 md:p-6 relative overflow-hidden flex-1 flex flex-col justify-between'>
                      
                      <CardContent>
                          <CardTitle className='mb-4'>{course.name}</CardTitle>

                        <CardDescription className='mb-4'>{course.description}</CardDescription>
                      </CardContent>

                      <CardFooter>
                          <CardDate course={course} getTime={getTimeAgo}/>

                          <Button 
                          variant={'grid'} size={'grid'}
                          onClick={() => {navigate(`/courses/${course.uuid}`)}}
                          className={cn(
                            'bg-linear-to-br',
                            colorStyles.bg[courseColor],
                            colorStyles.text[courseColor]
                          )}>
                          <span className='font-semibold'>Zobrazit</span>
                        </Button>

                      </CardFooter>
                    </div>
                  </Card>
                );
              })}
            </div>}

            {/* Empty state */}
            {displayedCourses.length === 0 && !isLoading &&(
              <EmptyStateComp onClick={() => {setSearchQuery(''); setDisplayCount(9)}}/>
            )}

            {/* Load More button */}
            {hasMoreCourses && (
              <div className='mt-8 text-center'>
                <Button variant='primary'size='primary' 
                  onClick={() => { loadMoreCourses(); }}>
                  Načíst další kurzy
                </Button>
              </div>
            )}
          </>
      </div>
    </div>
  )
}

export default CoursesPage