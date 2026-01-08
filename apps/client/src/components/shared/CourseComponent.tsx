import React, { useState } from 'react'
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
import { Check, Edit, Trash2, X } from 'lucide-react'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'

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
      isDraft?: true
      onEdit: () => void
      onSaveDraft?: (data: { name: string; description?: string }) => void
      onCancelDraft?: () => void
    }

const CourseComponent = (props: CourseCompProps) => {
  const { course, index, type } = props
  const navigate = useNavigate()
  const courseColor = colors[index % 3]

  const [state, setState] = useState({
    isEditing: type === 'edit' && 'isDraft' in props ? props.isDraft : false,
    tempName: course.name || '',
    tempDescription: course.description || '',
    nameError: '',
    saving: false,
  })

  const handleNameChange = (name: string) => {
    setState((prev) => ({
      ...prev,
      tempName: name,
      nameError: !name.trim() ? 'Název je povinný' : '',
    }))
  }

  const saveEdit = async () => {
    if (!state.tempName.trim()) {
      setState((prev) => ({ ...prev, nameError: 'Název je povinný' }))
      return
    }

    if (
      type === 'edit' &&
      'isDraft' in props &&
      props.isDraft &&
      props.onSaveDraft
    ) {
      setState((prev) => ({ ...prev, saving: true }))
      try {
        props.onSaveDraft({
          name: state.tempName,
          description: state.tempDescription,
        })
        toast.success('Kurz vytvořen')
      } catch (err) {
        console.error('Save error:', err)
        toast.error('Chyba při vytváření kurzu')
        setState((prev) => ({ ...prev, saving: false }))
      }
    }
  }

  const cancelEdit = () => {
    if (
      type === 'edit' &&
      'isDraft' in props &&
      props.isDraft &&
      props.onCancelDraft
    ) {
      props.onCancelDraft()
    } else {
      setState({
        isEditing: false,
        tempName: course.name,
        tempDescription: course.description || '',
        nameError: '',
        saving: false,
      })
    }
  }

  return (
    <Card key={course.uuid}>
      <div
        className={`h-2 bg-linear-to-r ${colorStyles.gradient[courseColor]}`}
      />

      <div className='p-4 md:p-6 relative overflow-hidden flex-1 flex flex-col justify-between'>
        <CardContent>
          {/* Název - editovatelný v režimu editace */}
          {state.isEditing ? (
            <div className='space-y-1 mb-2 md:mb-4'>
              <Textarea
                value={state.tempName}
                onChange={(e) => handleNameChange(e.target.value)} // ← Змінено
                className={cn(
                  'font-semibold text-base sm:text-lg lg:text-xl md:placeholder:text-lg overflow-hidden flex items-center sm:py-1.8',
                  state.nameError && 'border-destructive', // ← Червона рамка
                )}
                minRows={1}
                maxRows={3}
                placeholder='Název kurzu'
                disabled={state.saving}
              />
              {state.nameError && ( // ← Показати помилку
                <p className='text-xs text-destructive'>{state.nameError}</p>
              )}
            </div>
          ) : (
            <CardTitle className='mb-2 md:mb-4'>{course.name}</CardTitle>
          )}

          {/* Popis - editovatelný v režimu editace */}
          {state.isEditing ? (
            <Textarea
              value={state.tempDescription}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  tempDescription: e.target.value,
                }))
              }
              className='mb-2 md:mb-4 text-xs sm:text-sm md:text-sm lg:text-sm sm:py-1.8'
              minRows={2}
              maxRows={5}
              placeholder='Popis kurzu (volitelné)'
              disabled={state.saving}
            />
          ) : (
            <CardDescription className='mb-2 md:mb-4 line-clamp-3'>
              {course.description}
            </CardDescription>
          )}
        </CardContent>

        <CardFooter>
          <CardDate
            course={course}
            getTime={getTimeAgo}
            isDraft={'isDraft' in props && props.isDraft}
          />

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

          {type === 'edit' &&
            (state.isEditing ? (
              <div className='space-x-2'>
                <EditBtn
                  icon={Check}
                  onClick={saveEdit}
                  classNameBtn='hover:bg-secondary/20'
                  iconClassName='text-secondary size-4 sm:size-5'
                  disabled={state.saving || !!state.nameError}
                />
                <EditBtn
                  icon={X}
                  onClick={cancelEdit}
                  classNameBtn='hover:bg-destructive/20'
                  iconClassName='text-destructive size-4 sm:size-5'
                  disabled={state.saving}
                />
              </div>
            ) : (
              <div className='flex gap-2'>
                <EditBtn icon={Edit} onClick={props.onEdit} />
                <EditBtn type='delete' />
              </div>
            ))}
        </CardFooter>
      </div>
    </Card>
  )
}

export default CourseComponent
