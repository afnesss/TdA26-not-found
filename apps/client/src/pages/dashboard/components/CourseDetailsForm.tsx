import ThinkIcon from '@/assets/t-think-blue.svg?react'
import Breadcrumb from '@/components/shared/Breadcrumb'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { handleCapitalizedInput } from '@/lib/capitalize'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { buildOrgDashboardPath } from '@/lib/routes'
import {
  CourseUpdateRequestSchema,
  type CourseSummary,
  type CourseUpdateRequest,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { handleSaveOnEnter } from '@/pages/CoursePage/utils/helperFunctions'
import { useUpdateCourseMutation } from '@/pages/CoursePage/utils/useCourseMutation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useParams } from 'react-router-dom'

const CourseDetailsForm = ({
  selectedCourse,
}: {
  selectedCourse: CourseSummary
}) => {
  const { orgSlug } = useParams<{ orgSlug?: string }>()
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

  const { mutate: updateCourseMutation, isPending: updateCoursePending } =
    useUpdateCourseMutation(selectedCourse.uuid, (updatedCourse) => {
      reset({
        name: updatedCourse?.name,
        description: updatedCourse?.description ?? '',
      })
    })
  const formValues = useWatch({
    control,
    defaultValue: {
      name: selectedCourse.name,
      description: selectedCourse.description ?? '',
    },
  })

  const handleSave = handleSubmit((data) => {
    updateCourseMutation({
      name: data.name ?? selectedCourse.name,
      description: data.description ?? selectedCourse.description ?? undefined,
    })
  })

  return (
    <Card
      key={selectedCourse.uuid}
      className='bg-background rounded-xl shadow-md hover:shadow-md hover:scale-100 hover:translate-0 overflow-hidden cursor-auto'
    >
      <div className={cn(headerLineHeight, colorStyles.line['accent-teal'])} />
      <div className='p-4 lg:p-6 -mt-2'>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <Breadcrumb
              items={[
                { label: 'Sprava kurzů', path: buildOrgDashboardPath(orgSlug) },
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
          <ThinkIcon className='w-10 h-10 md:w-11 md:h-12 text-primary' />
        </div>
        <CardContent className='space-y-4 mt-5'>
          <div className='flex flex-col gap-2'>
            <FormField
              label='Název kurzu'
              inputProps={{
                value: formValues.name ?? selectedCourse?.name ?? '',
                onChange: (e) => {
                  const capitalizedValue = handleCapitalizedInput(
                    e.target.value,
                    formValues.name ?? '',
                  )
                  setValue('name', capitalizedValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                },
                onKeyDown: (e) => handleSaveOnEnter(e, handleSave),
                type: 'text',
                placeholder: 'Název kurzu',
                disabled: updateCoursePending || isSubmitting,
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
                  const capitalizedValue = handleCapitalizedInput(
                    e.target.value,
                    formValues.description ?? '',
                  )
                  setValue('description', capitalizedValue, {
                    shouldDirty: true,
                  })
                },
                onKeyDown: handleSaveOnEnter,
                placeholder: 'Zadejte popis kurzu',
                disabled: updateCoursePending || isSubmitting,
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
              disabled={!isDirty || updateCoursePending}
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
