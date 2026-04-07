import Breadcrumb from '@/components/shared/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Children, type ReactNode } from 'react'
import thinkIconUrl from '@/assets/t-idea-blue.svg'
import { Calendar } from 'lucide-react'
import { handleSaveOnEnter } from '@/pages/CoursePage/utils/helperFunctions'

type BreadcrumbItem = {
  label: string
  path?: string
}

type EditableDetailCardProps = {
  breadcrumbItems: BreadcrumbItem[]
  gradient: keyof typeof colorStyles.line
  onNameChange?: (value: string) => void
  onDescriptionChange?: (value: string) => void
  onEnterSave?: () => void
  onCancelEdit?: () => void
  disabled?: boolean
  isDirty?: boolean
  saveDisabled?: boolean
  topBadges?: ReactNode
  topActions?: ReactNode
  headerBottom?: ReactNode
  footerActions?: ReactNode
  footerMeta?: ReactNode
  hideDatesOnSmall?: boolean
  noActionsSlot?: ReactNode
  nameValue: string
  descriptionValue?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  extraDateMeta?: {
    label: string
    value?: string | Date | null
    withTime?: boolean
  }
  labels?: {
    saveMobile?: string
    saveDesktop?: string
    name?: string
    namePlaceholder?: string
    nameRequired?: string
    description?: string
    descriptionPlaceholder?: string
    createdAt?: string
    updatedAt?: string
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
  onEnterSave,
  onCancelEdit,
  disabled = false,
  isDirty = false,
  saveDisabled = false,
  topBadges,
  topActions,
  headerBottom,
  footerActions,
  footerMeta,
  hideDatesOnSmall = false,
  noActionsSlot,
  nameValue,
  descriptionValue,
  createdAt,
  updatedAt,
  extraDateMeta,
  labels,
}: EditableDetailCardProps) => {
  const showUpdatedAt =
    updatedAt &&
    createdAt &&
    new Date(createdAt).getTime() !== new Date(updatedAt).getTime()
  const hasTopActions = Boolean(topActions && Children.count(topActions) > 0)
  const isNameEmpty = !disabled && !nameValue.trim()
  const showInlineSave = !disabled && isDirty

  const resolvedFooterActions = showInlineSave ? (
    <Button
      variant='primary'
      size='sm'
      onClick={() => onEnterSave?.()}
      disabled={saveDisabled || isNameEmpty}
    >
      <span className='sm:hidden'>{labels?.saveMobile ?? 'Uložit'}</span>
      <span className='hidden sm:inline'>
        {labels?.saveDesktop ?? 'Uložit změny'}
      </span>
    </Button>
  ) : (
    footerActions
  )

  return (
    <Card className='border border-border/60 shadow-md bg-background rounded-xl cursor-auto'>
      <div className={cn(headerLineHeight, colorStyles.line[gradient])} />

      <div
        className={cn(
          'p-4 lg:p-6 -mt-2',
          disabled && 'gap-1 sm:gap-2 flex flex-col',
        )}
      >
        <div className={cn(disabled ? '' : 'mb-4 space-y-3')}>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-wrap items-center gap-3 min-w-0'>
              <Breadcrumb items={breadcrumbItems} />
              {topBadges && (
                <div className='flex flex-wrap items-center gap-2'>
                  {topBadges}
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-2 shrink-0'>
              {hasTopActions && !showInlineSave && (
                <div className='flex flex-wrap items-center gap-2'>
                  {topActions}
                </div>
              )}
              <div className='shrink-0'>
                {noActionsSlot ?? (
                  <img
                    src={thinkIconUrl}
                    className='w-8 h-8 md:w-9 md:h-9 opacity-90'
                    alt=''
                    aria-hidden='true'
                  />
                )}
              </div>
            </div>
          </div>

          {disabled ? (
            <div className='flex flex-col gap-1 sm:gap-2'>
              <Label className='mb-0 font-bold' size='lg'>
                {nameValue}
              </Label>
              {descriptionValue ? (
                <p className='text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap'>
                  {descriptionValue}
                </p>
              ) : null}
            </div>
          ) : null}

          {headerBottom && <div>{headerBottom}</div>}
        </div>

        <CardContent className='space-y-4 p-0'>
          {disabled ? null : (
            <div className='space-y-3'>
              <div>
                <Label size='sm' className='mb-1 block'>
                  {labels?.name ?? 'Název'}
                </Label>
                <Textarea
                  value={nameValue}
                  onChange={(e) => onNameChange?.(e.target.value)}
                  onKeyDown={(e) =>
                    handleSaveOnEnter(e, onEnterSave, onCancelEdit)
                  }
                  minRows={1}
                  maxRows={2}
                  placeholder={labels?.namePlaceholder ?? 'Zadejte název'}
                  className={cn(
                    'font-semibold text-base md:text-lg',
                    isNameEmpty && 'border-destructive',
                  )}
                />
                {isNameEmpty && (
                  <p className='error-text'>
                    {labels?.nameRequired ?? 'Název je povinný'}
                  </p>
                )}
              </div>

              <div>
                <Label size='sm' className='mb-1 block'>
                  {labels?.description ?? 'Popis'}
                </Label>
                <Textarea
                  value={descriptionValue ?? ''}
                  onChange={(e) => onDescriptionChange?.(e.target.value)}
                  onKeyDown={(e) =>
                    handleSaveOnEnter(e, onEnterSave, onCancelEdit)
                  }
                  minRows={1}
                  maxRows={4}
                  placeholder={
                    labels?.descriptionPlaceholder ??
                    'Zadejte popis (volitelné)'
                  }
                />
              </div>
            </div>
          )}

          <CardFooter className='flex justify-between gap-4 p-0 pt-3'>
            <div className='flex flex-wrap items-center gap-5'>
              <div
                className={cn(
                  'flex gap-3',
                  hideDatesOnSmall && 'hidden sm:flex',
                )}
              >
                <span className='flex flex-col items-center gap-1'>
                  <span className='text-xs text-gray-500'>
                    {labels?.createdAt ?? 'Vytvořeno'}
                  </span>
                  <span className='shrink-0 text-xs md:text-sm font-medium text-gray-600'>
                    {fmtDate(createdAt)}
                  </span>
                </span>
                {showUpdatedAt && (
                  <span className='flex flex-col items-center gap-1'>
                    <span className='text-xs text-gray-500'>
                      {labels?.updatedAt ?? 'Upraveno'}
                    </span>
                    <span className='shrink-0 text-xs md:text-sm font-medium text-gray-600'>
                      {fmtDate(updatedAt)}
                    </span>
                  </span>
                )}
              </div>

              {extraDateMeta && (
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground/70'>
                    {extraDateMeta.label}
                  </span>
                  <span className='flex flex-col items-center gap-1.5'>
                    <Calendar size={14} className='text-primary' />
                    <span className='text-xs md:text-sm font-medium'>
                      {extraDateMeta.withTime
                        ? fmtDateTime(extraDateMeta.value ?? undefined)
                        : fmtDate(extraDateMeta.value ?? undefined)}
                    </span>
                  </span>
                </div>
              )}
              {footerMeta && <div>{footerMeta}</div>}
            </div>

            {resolvedFooterActions && <div>{resolvedFooterActions}</div>}
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  )
}

export default EditableDetailCard
