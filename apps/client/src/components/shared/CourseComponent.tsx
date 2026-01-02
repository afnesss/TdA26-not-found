import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CourseSummary } from '@/lib/schemas'
import CardDate from '../../pages/CoursesPage/components/CardDate'
import { Button } from '@/components/ui/button'
import { getTimeAgo } from '@/lib/utils'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { colorStyles, colors } from '@/lib/constants'
import { Edit, Trash2 } from 'lucide-react'
import EditBtn from './EditBtn'

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

const CourseComponent = (props: CourseCompProps) => {
  const { course, index, type } = props
  const navigate = useNavigate()
  const courseColor = colors[index % 3]

  return (
    <Card key={course.uuid}>
      <div
        className={`h-2 bg-linear-to-r ${colorStyles.gradient[courseColor]}`}
      />

      <div className='p-4 md:p-6 relative overflow-hidden flex-1 flex flex-col justify-between'>
        <CardContent>
          <CardTitle className='mb-4'>{course.name}</CardTitle>

          <CardDescription className='mb-4'>
            {course.description}
          </CardDescription>
        </CardContent>

        <CardFooter>
          <CardDate course={course} getTime={getTimeAgo} />
          {type === 'classic' && (
            <Button
              variant={'grid'}
              size={'grid'}
              onClick={() => {
                navigate(`/courses/${course.uuid}`)
              }}
              className={cn(
                'bg-linear-to-br',
                colorStyles.bg[courseColor],
                colorStyles.text[courseColor],
              )}
            >
              <span className='font-semibold'>Zobrazit</span>
            </Button>
          )}

          {type === 'edit' && (
            <div className='flex gap-2'>
              <EditBtn icon={Edit} onClick={props.onEdit} />
              <EditBtn
                icon={Trash2}
                bgColor='destructive'
                classNameBtn='hover:bg-destructive/10'
              />
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}

export default CourseComponent
