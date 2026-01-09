import { updateCourse } from '@/api/queries/courseQueries'
import Breadcrumb from '@/components/shared/Breadcrumb'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorStyles } from '@/lib/constants'
import type { CourseSummary } from '@/lib/schemas'
import { useState } from 'react'

const CourseDetailsForm = ({
  selectedCourse,
}: {
  selectedCourse: CourseSummary
}) => {
  const [courseEdits, setCourseEdits] = useState<
    Partial<{ name: string; description: string }>
  >({})
  const [hasChanges, setHasChanges] = useState(false)

  return (
    <Card
      key={selectedCourse.uuid}
      className='bg-background rounded-xl shadow-md hover:shadow-md hover:scale-100 hover:translate-0 overflow-hidden'
    >
      <div
        className={`h-2 bg-linear-to-r ${colorStyles.gradient['accent-teal']}`}
      />
      <div className='p-4 lg:p-6 -mt-2'>
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

        <CardContent className='space-y-4 mt-5'>
          <div className='flex flex-col gap-2'>
            <FormField
              label='Název kurzu'
              inputProps={{
                value: courseEdits.name ?? selectedCourse?.name ?? '',
                onChange: (e) => {
                  setCourseEdits((prev) => ({ ...prev, name: e.target.value }))
                  setHasChanges(true)
                },
                type: 'text',
                placeholder: 'Název kurzu',
              }}
            />
            <FormField
              label='Popis kurzu'
              multiline
              textareaProps={{
                value:
                  courseEdits.description ?? selectedCourse?.description ?? '',
                onChange: (e) => {
                  setHasChanges(true)
                  setCourseEdits((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                },
                placeholder: 'Zadejte popis kurzu',
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
              size='primary'
              onClick={() => {
                setHasChanges(false)
                updateCourse(selectedCourse.uuid, {
                  name: courseEdits.name ?? selectedCourse.name,
                  description:
                    courseEdits.description ??
                    selectedCourse.description ??
                    undefined,
                })
              }}
              disabled={!hasChanges}
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
