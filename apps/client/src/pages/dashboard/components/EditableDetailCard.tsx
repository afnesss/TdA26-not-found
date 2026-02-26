import Breadcrumb from '@/components/shared/Breadcrumb'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BreadcrumbItem = {
  label: string
  path?: string
}

type EditableDetailCardProps = {
  breadcrumbItems: BreadcrumbItem[]
  gradient: keyof typeof colorStyles.gradient

  onNameChange?: (value: string) => void
  onDescriptionChange?: (value: string) => void
  disabled?: boolean
  topBadges?: ReactNode
  topActions?: ReactNode
  headerBottom?: ReactNode
  footerActions?: ReactNode
  nameValue: string
  descriptionValue?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  extraDateMeta?: {
    label: string
    value?: string | Date | null
    withTime?: boolean
  }
}

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString('cs-CZ') : 'N/A'

const fmtDateTime = (d?: string | Date) =>
  d
    ? new Date(d).toLocaleString('cs-CZ', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    : 'N/A'

const EditableDetailCard = ({
  breadcrumbItems,
  gradient,
  onNameChange,
  onDescriptionChange,
  disabled = false,
  topBadges,
  topActions,
  headerBottom,
  footerActions,
  nameValue,
  descriptionValue,
  createdAt,
  updatedAt,
  extraDateMeta,
}: EditableDetailCardProps) => {
  const showUpdatedAt =
    updatedAt &&
    createdAt &&
    new Date(createdAt).getTime() !== new Date(updatedAt).getTime()

  return (
    <Card className='border border-border/60 shadow-md bg-background rounded-xl cursor-auto'>
      {/* Gradient bar */}
      <div className={`h-2 bg-linear-to-r ${colorStyles.gradient[gradient]}`} />

      <div className='p-4 lg:p-6 -mt-2'>
        {/* Header */}
        <div className='mb-4 space-y-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex flex-wrap items-center gap-3 min-w-0'>
              <Breadcrumb items={breadcrumbItems} />
              {topBadges && (
                <div className='flex flex-wrap items-center gap-2'>
                  {topBadges}
                </div>
              )}
            </div>

            {topActions && (
              <div className='flex flex-wrap items-end gap-2'>{topActions}</div>
            )}
          </div>

          {headerBottom && <div>{headerBottom}</div>}
        </div>

        {/* Form fields */}
        <CardContent className='space-y-4 p-0'>
          <div className='space-y-4'>
            <div>
              <Label size='sm' className='mb-1 block'>
                Název
              </Label>
              <Textarea
                value={nameValue}
                onChange={(e) => onNameChange?.(e.target.value)}
                // disabled={disabled}
                minRows={1}
                maxRows={2}
                className={cn(
                  'font-semibold text-base md:text-lg',
                  disabled && 'bg-muted/20 opacity-80',
                )}
                readOnly={disabled}
              />
            </div>

            <div>
              <Label size='sm' className='mb-1 block'>
                Popis
              </Label>
              <Textarea
                value={descriptionValue ?? ''}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                // disabled={disabled}
                minRows={1}
                maxRows={4}
                className={cn(disabled && 'bg-muted/20 opacity-80')}
                readOnly={disabled}
              />
            </div>
          </div>

          {/* Footer with dates and actions */}
          <CardFooter className='flex flex-wrap justify-between gap-4 p-0 pt-4'>
            <div className='flex flex-wrap gap-6 md:gap-10'>
              <div>
                <Label size='sm' className='mb-1 block'>
                  Vytvořeno
                </Label>
                <p className='text-gray-900 font-medium'>
                  {fmtDate(createdAt)}
                </p>
              </div>

              {showUpdatedAt && (
                <div>
                  <Label size='sm' className='mb-1 block'>
                    Upraveno
                  </Label>
                  <p className='text-gray-900 font-medium'>
                    {fmtDate(updatedAt)}
                  </p>
                </div>
              )}

              {extraDateMeta && (
                <div>
                  <Label size='sm' className='mb-1 block'>
                    {extraDateMeta.label}
                  </Label>
                  <p className='text-gray-900 font-medium'>
                    {extraDateMeta.withTime
                      ? fmtDateTime(extraDateMeta.value ?? undefined)
                      : fmtDate(extraDateMeta.value ?? undefined)}
                  </p>
                </div>
              )}
            </div>

            {footerActions && <div>{footerActions}</div>}
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  )
}

export default EditableDetailCard
