import React, { useState } from 'react'
import { Search, Calendar, ArrowRight, BookOpen, MessageSquare, Filter } from 'lucide-react'
import {Button} from '../components/ui/button';
import HintPageText from '../components/shared/HintPageText';

const dateNow = Date.now();

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(9);
 
  
  const mockCourses = [
    {
      uuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      name: "Kritické myšlení pro začátečníky",
      description: "Naučte se základy kritického myšlení a logické argumentace. Tento kurz vás provede klíčovými koncepty a technikami.",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    },
    {
      uuid: "2b7c4d8e-9a1f-4c3b-8e5f-1d2a3b4c5d6e",
      name: "Kreativní řešení problémů",
      description: "Rozvíjejte svou kreativitu a najděte inovativní přístupy k řešení složitých problémů.",
      createdAt: "2024-02-20T14:30:00Z",
      updatedAt: "2024-02-25T09:15:00Z"
    },
    {
      uuid: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
      name: "Argumentace a rétorika",
      description: "Zdokonalte své schopnosti v oblasti argumentace, přesvědčování a veřejného vystupování.",
      createdAt: "2024-03-10T09:15:00Z",
      updatedAt: "2024-03-15T11:00:00Z"
    },
        {
      uuid: "4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f",
      name: "Logika a filozofie",
      description: "Prozkoumejte základy logického myšlení a filozofických konceptů pro lepší porozumění světu.",
      createdAt: "2024-03-25T11:00:00Z",
      updatedAt: "2024-03-30T16:45:00Z"
    },
    {
      uuid: "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
      name: "Etické rozhodování",
      description: "Naučte se řešit morální dilema a činit etická rozhodnutí v osobním i profesním životě.",
      createdAt: "2024-04-05T15:30:00Z",
      updatedAt: "2024-04-10T10:20:00Z"
    },
    {
      uuid: "5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c",
      name: "Mediální gramotnost",
      description: "Rozvíjejte schopnost kriticky hodnotit informace z médií a rozpoznávat dezinformace.",
      createdAt: "2024-04-18T09:00:00Z",
      updatedAt: "2024-04-22T13:30:00Z"
    },
    {
      uuid: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f8a2b",
      name: "Argumentace a rétorika",
      description: "Zdokonalte své schopnosti v oblasti argumentace, přesvědčování a veřejného vystupování.",
      createdAt: "2024-03-10T09:15:00Z",
      updatedAt: "2024-03-15T11:00:00Z"
    },
        {
      uuid: "4c2d6e7f-8a9b-0c1d-2e3f-4a5b657d8e9f",
      name: "Logika a filozofie",
      description: "Prozkoumejte základy logického myšlení a filozofických konceptů pro lepší porozumění světu.",
      createdAt: "2024-03-25T11:00:00Z",
      updatedAt: "2024-03-30T16:45:00Z"
    },
    {
      uuid: "7e8f920b-1c2d-3e4f-5a6b-7c8d9e0f8a2b",
      name: "Argumentace a rétorika",
      description: "Zdokonalte své schopnosti v oblasti argumentace, přesvědčování a veřejného vystupování.",
      createdAt: "2024-03-10T09:15:00Z",
      updatedAt: "2024-03-15T11:00:00Z"
    },
        {
      uuid: "4c5d6e7f-8a9b-0c1d-2e3f-4a5b657d8e9f",
      name: "Logika a filozofie",
      description: "Prozkoumejte základy logického myšlení a filozofických konceptů pro lepší porozumění světu.",
      createdAt: "2024-03-25T11:00:00Z",
      updatedAt: "2024-03-30T16:45:00Z"
    },
  ];

  const filters = [
    { id: 'all', label: 'Všechny kurzy', icon: BookOpen },
    { id: 'newest', label: 'Nejnovější', icon: Calendar },
    { id: 'updated', label: 'Nedávno aktualizované', icon: ArrowRight }
  ];

  const colors = ['accent-teal-light', 'accent-teal', 'accent-teal-dark'];

  const getIconBgClass = (color) => {
    const colorMap = {
      'accent-teal-light': 'bg-linear-to-br from-accent-teal-light/20 to-accent-teal-light/60',
      'accent-teal': 'bg-linear-to-br from-accent-teal/20 to-accent-teal/60',
      'accent-teal-dark': 'bg-linear-to-br from-accent-teal-dark/20 to-accent-teal-dark/60',
    };
    return colorMap[color];
  };

  const getGradientClass = (color) => {
    const gradientMap = {
      'accent-teal-light': 'from-secondary via-accent-teal-light to-accent-teal-light',
      'accent-teal': 'from-accent-teal-light via-accent-teal to-accent-teal',
      'accent-teal-dark': 'from-accent-teal via-accent-teal-dark to-primary',
    };
    return gradientMap[color];
  };

  // Фільтрація курсів
  const filteredCourses = mockCourses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Сортування згідно фільтру
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (selectedFilter === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (selectedFilter === 'updated') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    return 0;
  });

  const hasMoreCourses = sortedCourses.length > displayCount;
   const displayedCourses = sortedCourses.slice(0, displayCount)
  const loadMoreCourses = () => {
    setDisplayCount(prev => prev+6);
    setIsLoading(false)
  }

  // Розрахунок часу з останнього оновлення
  const getTimeAgo = (date) => {
    const now = new Date();
    const updated = new Date(date);
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
          <HintPageText text="Dostupné kurzy" icon={BookOpen} spanText={mockCourses.length.toString()}/>
          
          {/* Search Bar */}
          <div className='relative group max-w-2xl w-full'>
            <Search 
              className='absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 
                         group-focus-within:text-primary transition-all duration-300' 
              size={20} 
            />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Vyhledat kurz podle názvu...'
              className='w-full pl-12 pr-4 py-2 rounded-xl text-foreground text-sm md:text-base
                       bg-background/90 focus-ring-input
                       transition-all duration-300 outline-none shadow-sm
                       hover:shadow-md focus:shadow-lg'
            />
            
            {/* Počet výsledků */}
            {searchQuery && (
              <div className='absolute right-4 top-1/2 -translate-y-1/2 
                           bg-primary text-background text-xs px-2 py-1 rounded-full'>
                {displayedCourses.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Фільтри */}
      <div className='max-w-7xl mx-auto px-3 md:px-6 lg:px-12'>
        <div className='flex flex-wrap gap-3 justify-center'>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-1.5 rounded-xl max-sm:text-xs text-sm font-medium
                       transition-all duration-300 flex items-center gap-2
                       ${selectedFilter === filter.id 
                         ? 'bg-primary text-white shadow-md' 
                         : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                       }`}
            >
              <filter.icon className='max-sm:w-3 max-sm:h-3 h-4 w-4' />
              {filter.label}
            </button>
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
                  <div
                    key={course.uuid}
                    className='bg-white rounded-xl shadow-md hover:shadow-2xl 
                             transition-all duration-300 overflow-hidden group
                             border-2 border-secondary/20 hover:border-secondary
                             cursor-pointer flex flex-col hover:-translate-y-2'
                  >
                    {/* Градієнт топ */}
                    <div className={`h-3 bg-linear-to-r ${getGradientClass(courseColor)}`} />
                    
                    <div className='p-4 md:p-6 relative overflow-hidden flex-1 flex flex-col justify-between'>
                      
                      {/* Hover glow effect */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl 
                                  -translate-y-1/2 translate-x-1/2 ${getIconBgClass(courseColor)}
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <div>

                        {/* Назва курсу */}
                        <div className='flex items-start justify-between mb-4'>
                          <h3 className='text-lg md:text-xl font-bold text-neutral-black 
                                      group-hover:text-primary transition-colors duration-300 
                                      relative z-10 line-clamp-2 leading-snug flex-1 pr-2'>
                            {course.name}
                          </h3>
                        
                        </div>


                        {/* Опис */}
                        <p className='text-sm text-gray-600 mb-4 line-clamp-3 relative z-10 leading-relaxed'>
                          {course.description}
                        </p>

                        {/* Badge з останнім оновленням (якщо недавно) */}
                        {new Date(course.updatedAt) > new Date(dateNow - 7 * 24 * 60 * 60 * 1000) && (
                          <div className='inline-flex items-center gap-1.5 px-3 py-1.5 
                                     bg-linear-to-r from-accent-teal-light/20 to-accent-teal/20 
                                     rounded-full mb-4 relative z-10'>
                            <div className='w-2 h-2 bg-accent-teal-light rounded-full animate-pulse' />
                            <span className='text-xs font-medium text-accent-teal'>
                              Nedávno aktualizováno
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className='flex items-center gap-2 text-xs md:text-sm text-gray-500 
                                    relative z-10 justify-between pt-4 border-t border-gray-100'>
                        <div className='flex flex-col gap-1'>
                          <div className='flex items-center gap-1.5'>
                            <Calendar size={14} className='text-primary' />
                            <span>
                              {new Date(course.createdAt).toLocaleDateString('cs-CZ', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className='text-xs text-gray-400'>
                            Aktualizováno {getTimeAgo(course.updatedAt)}
                          </span>
                        </div>


                          <button 
                        className={`px-6 py-2.5 rounded-xl ${getIconBgClass(courseColor)} 
                                    flex items-center justify-between
                                    hover:scale-110 transition-transform duration-300 cursor-pointer`}
                      >
                        <span className='font-semibold'>Zobrazit</span>
                        {/* <ArrowRight 
                          className='group-hover/btn:translate-x-1 transition-all duration-300'
                          size={18} 
                        /> */}
                      </button>
                      </div>
                    </div>
                  </div>
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
                <h3 className='text-xl md:text-2xl font-bold text-neutral-black mb-7'>
                  Žádné kurzy nenalezeny
                </h3>
                <Button 
                  variant='primary'
                  size='primary' 
                  onClick={() => {setSearchQuery(''); setDisplayCount(9)}}
                >
                  Vymazat vyhledávání
                </Button>
              </div>
            )}

            {/* Load More button */}
            {hasMoreCourses && (
              <div className='mt-8 text-center'>
                <Button 
                  variant='primary'
                  size='primary' 
                  onClick={() => {setIsLoading(true); loadMoreCourses();}}
                >
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