import { useEffect, useState } from 'react'
import { Search, Calendar, ArrowRight, BookOpen} from 'lucide-react'
import {Button} from '../../components/ui/button';
import HintPageText from '../../components/shared/HintPageText';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { colorStyles, colors } from '@/lib/constants';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CoursesSummary } from '@/lib/types';
import CardDate from './components/CardDate';
import { Label } from '@/components/ui/label';
import { getCourses } from '@/api/queries';
import { useNavigate } from 'react-router';
// const dateNow = Date.now();


const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(9);
  const [courses, setCourses] = useState<CoursesSummary[]>([]);
  const navigate = useNavigate();

  useEffect ( () => {
    const getData = async () =>{
      const data: CoursesSummary[] = await getCourses();
      setCourses(data);
    }
    getData();
  }, [])

  const filters = [
    { id: 'all', label: 'Všechny kurzy', icon: BookOpen },
    { id: 'newest', label: 'Nejnovější', icon: Calendar },
    { id: 'updated', label: 'Nedávno aktualizované', icon: ArrowRight }
  ];

  
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const dateKey = selectedFilter === 'newest' ? 'createdAt' :
    selectedFilter === 'updated' ? 'updatedAt': null;

    if (!dateKey) return 0;

    return new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime();
  });

  const hasMoreCourses = sortedCourses.length > displayCount;
   const displayedCourses = sortedCourses.slice(0, displayCount)
  const loadMoreCourses = () => {
    setDisplayCount(prev => prev+6);
    setIsLoading(false)
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
      
      {/* Hero sekce */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 pt-3 pb-6'>
        <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-center items-center'>
          {/* Badge */}
          <HintPageText text="Dostupné kurzy" icon={BookOpen} spanText={searchQuery&& displayedCourses.length.toString() || courses.length.toString()}/>
          
          {/* Search Bar */}
          <div className='relative group max-w-2xl w-full'>
            <Search 
              className='absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 
                         group-focus-within:text-primary transition-all duration-300' 
              size={20} />
            <Input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Vyhledat kurz podle názvu...'
              className='pl-12 pr-12'/>
            
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
        <div className='flex flex-wrap gap-3 justify-center'>
          {filters.map((filter) => (
            <Button
              variant='filter'
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                       ${selectedFilter === filter.id 
                         ? 'bg-primary text-background shadow-md' 
                         : 'bg-background text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <filter.icon className='max-sm:w-3 max-sm:h-3 h-4 w-4' />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Kurzy Grid */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12 py-6 relative'>
        
        {/* Loading skeleton */}
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className='bg-white rounded-xl p-5 animate-pulse border-2 border-gray-100'>
                <div className='h-3 bg-gray-200 rounded mb-4' />
                <div className='h-10 bg-gray-200 rounded-xl mb-3' />
                <div className='h-6 bg-gray-200 rounded mb-3 w-3/4' />
                <div className='h-4 bg-gray-200 rounded mb-2' />
                <div className='h-4 bg-gray-200 rounded w-5/6 mb-4' />
                <div className='flex justify-between pt-4 border-t border-gray-200'>
                  <div className='h-4 bg-gray-200 rounded w-24' />
                  <div className='h-8 w-8 bg-gray-200 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        ) : (
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

                      {/* Footer */}
                      <CardFooter>
                          <CardDate course={course} getTime={getTimeAgo}/>

                          <Button 
                          variant={'grid'} size={'grid'}
                          className={cn(
                            'bg-linear-to-br',
                            colorStyles.bg[courseColor],
                            colorStyles.text[courseColor]
                          )}>
                          <span className='font-semibold' onClick={() => {navigate(`/courses/${course.uuid}`)}}>Zobrazit</span>
                        </Button>

                      </CardFooter>
                    </div>
                  </Card>
                );
              })}
            </div>}

            {/* Empty state */}
            {displayedCourses.length === 0 && (
              <div className='text-center py-16'>
                <div className='w-22 h-22 bg-secondary/20 rounded-full flex items-center 
                           justify-center mx-auto mb-6'>
                  <Search size={45} className='text-primary' />
                </div>
              <Label asChild variant="emptyState"size="md">
                <h3>Žádné kurzy nenalezeny</h3>
              </Label>

                <Button variant='primary'size='primary' 
                  onClick={() => {setSearchQuery(''); setDisplayCount(9)}}>
                  Vymazat vyhledávání
                </Button>
              </div>
            )}

            {/* Load More button */}
            {hasMoreCourses && (
              <div className='mt-8 text-center'>
                <Button variant='primary'size='primary' 
                  onClick={() => {setIsLoading(true); loadMoreCourses();}}>
                  Načíst další kurzy
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CoursesPage