import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { colorStyles, colors } from '@/lib/constants'
import type { CourseSummary } from '@/lib/schemas'
import { cn, getTimeAgo } from '@/lib/utils'
import { Check, Edit, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import CardDate from '../../pages/CoursesPage/components/CardDate'
import EditBtn from '../../pages/dashboard/components/EditBtn'
import { Textarea } from '../ui/textarea'
import DeleteConfirmDialog from '../ui/AlertDialog'
import { useMediaQuery } from 'usehooks-ts'

interface CourseClassic {
  type: 'classic'
  course: CourseSummary
  index: number
}

interface CourseEdit {
  type: 'edit'
  course: CourseSummary
  index: number
  isDraft?: true
  onEdit: () => void
  onSaveDraft?: (data: { name: string; description?: string }) => void
  onCancelDraft?: () => void
  onDelete?: () => void
}

type CourseCompProps = CourseClassic | CourseEdit

const CourseComponent = (props: CourseCompProps) => {
  const { course, index, type } = props
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const navigate = useNavigate()
  const courseColor = colors[index % (isLg ? 3 : 2)]

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

  const handleCardClick = () => {
    if (state.isEditing) return

    if (type === 'classic') {
      navigate(`/courses/${course.uuid}`)
    } else if (type === 'edit') {
      props.onEdit()
    }
  }

  return (
    <Card
      key={course.uuid}
      className={'transition-colors cursor-pointer'}
      onClick={handleCardClick}
    >
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
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleNameChange(e.target.value)} // ← Змінено
                className={cn(
                  'font-semibold text-base sm:text-lg lg:text-xl overflow-hidden flex items-center sm:py-1.8 placeholder:pt-1',
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
              onClick={(e) => e.stopPropagation()}
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
              {course.description && course.description.length > 100
                ? (() => {
                    let truncated = course.description.slice(0, 100)
                    if (truncated.endsWith(',')) {
                      truncated = truncated.slice(0, -1)
                    }
                    return truncated + '...'
                  })()
                : course.description}
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
              onClick={(e) => {
                e.stopPropagation()
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
                  onClick={(e) => {
                    e?.stopPropagation()
                    saveEdit()
                  }}
                  classNameBtn='hover:bg-secondary/20'
                  iconClassName='text-secondary size-4 sm:size-5'
                  disabled={state.saving || !!state.nameError}
                />
                <EditBtn
                  icon={X}
                  onClick={(e) => {
                    e?.stopPropagation()
                    cancelEdit()
                  }}
                  classNameBtn='hover:bg-destructive/20'
                  iconClassName='text-destructive size-4 sm:size-5'
                  disabled={state.saving}
                />
              </div>
            ) : (
              <div className='flex gap-2'>
                <EditBtn
                  icon={Edit}
                  onClick={(e) => {
                    e?.stopPropagation()
                    props.onEdit()
                  }}
                />
                <DeleteConfirmDialog
                  trigger={
                    <EditBtn
                      type='delete'
                      onClick={(e) => e?.stopPropagation()}
                    />
                  }
                  itemName={course.name}
                  itemType='kurz'
                  onConfirm={() => {
                    if (props.onDelete) {
                      props.onDelete()
                    }
                  }}
                ></DeleteConfirmDialog>
              </div>
            ))}
        </CardFooter>
      </div>
    </Card>
  )
}

export default CourseComponent
