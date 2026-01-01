import React from 'react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CourseSummary } from '@/lib/schemas';
import CardDate from '../CoursesPage/components/CardDate';
import { Button } from '@/components/ui/button';
import { getTimeAgo } from '../utils/helperFuntions';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { colorStyles, colors } from '@/lib/constants';
import { Edit, Trash2 } from 'lucide-react';


type CourseCompProps =
  | {
      type: 'classic'
      course: CourseSummary
      index: number
    }
  | {
      type: 'edit'
      course: CourseSummary
      index: number
      onEdit: () => void
    }


const CourseComp = (props : CourseCompProps) => {
  const { course, index, type } = props;
  const navigate = useNavigate();
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
            {type === 'classic' &&
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
            }
            
            {type === 'edit' && 
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={props.onEdit}
                    className="hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>}


          </CardFooter>
        </div>
      </Card>
  )
}

export default CourseComp
