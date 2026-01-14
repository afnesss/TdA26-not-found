import { updateCourse } from '@/api/queries/courseQueries'
import Breadcrumb from '@/components/shared/Breadcrumb'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorStyles } from '@/lib/constants'
import {
  CourseUpdateRequestSchema,
  type CourseSummary,
  type CourseUpdateRequest,
} from '@/lib/schemas'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import icon from '@/assets/t-think-blue.svg'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

const CourseDetailsForm = ({
  selectedCourse,
}: {
  selectedCourse: CourseSummary
}) => {
  const queryClient = useQueryClient()

  const updateCourseMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      updateCourse(selectedCourse.uuid, data),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({
        queryKey: ['course', selectedCourse.uuid],
      })

      reset({
        name: updatedCourse?.name,
        description: updatedCourse?.description ?? '',
      })

      toast.success('Kurz byl aktualizovan')

      console.log('Course updated:', updatedCourse)
    },
    onError: (error) => {
      console.error('Update failed:', error)
      toast.error('Chyba při aktualizaci kurzu')
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    reset,
    setError,
  } = useForm<CourseUpdateRequest>({
    resolver: zodResolver(CourseUpdateRequestSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: selectedCourse.name,
      description: selectedCourse.description ?? '',
    },
  })

  const formValues = useWatch({
    control,
    defaultValue: {
      name: selectedCourse.name,
      description: selectedCourse.description ?? '',
    },
  })

  const handleSave = handleSubmit((data) => {
    updateCourseMutation.mutate({
      name: data.name ?? selectedCourse.name,
      description: data.description ?? selectedCourse.description ?? undefined,
    })
  })

  return (
    <Card
      key={selectedCourse.uuid}
      className='bg-background rounded-xl shadow-md hover:shadow-md hover:scale-100 hover:translate-0 overflow-hidden cursor-auto'
    >
      <div
        className={`h-2 bg-linear-to-r ${colorStyles.gradient['accent-teal']}`}
      />
      <div className='p-4 lg:p-6 -mt-2'>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <Breadcrumb
              items={[
                { label: 'Sprava kurzů', path: '/dashboard' },
                { label: 'Detaily kurzu' },
              ]}
              className='mb-2'
            />
            <CardTitle>
              <Label variant='title' size='lg'>
                Detaily kurzu
              </Label>
            </CardTitle>
          </div>
          <img src={icon} className='w-10 h-10 md:w-11 md:h-12 '></img>
        </div>
        <CardContent className='space-y-4 mt-5'>
          <div className='flex flex-col gap-2'>
            <FormField
              label='Název kurzu'
              inputProps={{
                value: formValues.name ?? selectedCourse?.name ?? '',
                onChange: (e) => {
                  setValue('name', e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                },
                type: 'text',
                placeholder: 'Název kurzu',
                disabled: updateCourseMutation.isPending || isSubmitting,
              }}
              className={cn(errors.name && 'border border-destructive')}
            />
            {errors.name && <p className='error-text'>{errors.name.message}</p>}
            <FormField
              label='Popis kurzu'
              multiline
              textareaProps={{
                value:
                  formValues.description ?? selectedCourse?.description ?? '',
                onChange: (e) => {
                  setValue('description', e.target.value, { shouldDirty: true })
                },
                placeholder: 'Zadejte popis kurzu',
                disabled: updateCourseMutation.isPending || isSubmitting,
              }}
            />
          </div>
          <CardFooter className='flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center gap-4 pt-4'>
            <div className='flex flex-row gap-10'>
              <div>
                <Label size='sm' className='mb-2'>
                  Datum vytvoření
                </Label>
                <p className='text-gray-900 font-medium'>
                  {selectedCourse.createdAt
                    ? new Date(selectedCourse.createdAt).toLocaleDateString(
                        'cs-CZ',
                      )
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label size='sm' className='mb-2'>
                  Poslední úprava
                </Label>
                <p className='text-gray-900 font-medium'>
                  {selectedCourse.updatedAt
                    ? new Date(selectedCourse.updatedAt).toLocaleDateString(
                        'cs-CZ',
                      )
                    : 'N/A'}
                </p>
              </div>
            </div>
            <Button
              variant='primary'
              size='grid'
              onClick={handleSave}
              disabled={!isDirty || updateCourseMutation.isPending}
              className='w-fit'
            >
              Uložit změny
            </Button>
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  )
}

export default CourseDetailsForm
