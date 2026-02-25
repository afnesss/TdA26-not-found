import Breadcrumb from '@/components/shared/Breadcrumb'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type BreadcrumbItem = {
  label: string
  path?: string
}

type EditableDetailCardProps = {
  breadcrumbItems: BreadcrumbItem[]
  title: string
  gradient: keyof typeof colorStyles.gradient

  onNameChange?: (value: string) => void
  onDescriptionChange?: (value: string) => void
  disabled?: boolean
  topBadges?: ReactNode
  topActions?: ReactNode
  footerActions?: ReactNode
  nameValue: string
  descriptionValue?: string
  createdAt?: string | Date
  updatedAt?: string | Date
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
  footerActions,
  nameValue,
  descriptionValue,
  createdAt,
  updatedAt,
}: EditableDetailCardProps) => {
  const headerRowRef = useRef<HTMLDivElement | null>(null)
  const breadcrumbRef = useRef<HTMLDivElement | null>(null)
  const badgesRef = useRef<HTMLDivElement | null>(null)
  const actionsRef = useRef<HTMLDivElement | null>(null)
  const [stackHeaderActions, setStackHeaderActions] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      if (!headerRowRef.current || !breadcrumbRef.current || !topActions) {
        setStackHeaderActions(false)
        return
      }

      const headerWidth = headerRowRef.current.clientWidth
      const breadcrumbWidth = breadcrumbRef.current.scrollWidth
      const badgesWidth = topBadges ? (badgesRef.current?.offsetWidth ?? 0) : 0
      const actionsWidth = actionsRef.current?.offsetWidth ?? 0
      const gap = 8

      const requiredWidth =
        breadcrumbWidth +
        (topBadges ? badgesWidth + gap : 0) +
        (actionsWidth ? actionsWidth + gap : 0)

      setStackHeaderActions(requiredWidth > headerWidth)
    }

    measure()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    if (headerRowRef.current) observer.observe(headerRowRef.current)
    if (breadcrumbRef.current) observer.observe(breadcrumbRef.current)
    if (badgesRef.current) observer.observe(badgesRef.current)
    if (actionsRef.current) observer.observe(actionsRef.current)

    return () => observer.disconnect()
  }, [breadcrumbItems, topBadges, topActions])

  return (
    <Card className='border border-border/60 shadow-md bg-background rounded-xl hover:shadow-md hover:scale-100 hover:translate-0 cursor-auto'>
      <div className={`h-2 bg-linear-to-r ${colorStyles.gradient[gradient]}`} />
      <div className='p-4 lg:p-6 -mt-2'>
        <div className='mb-2 space-y-2'>
          {!stackHeaderActions ? (
            <div
              ref={headerRowRef}
              className='flex justify-between items-start gap-2'
            >
              <div className='flex flex-wrap gap-2 items-center min-w-0'>
                <div ref={breadcrumbRef} className='min-w-0'>
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                {topBadges && (
                  <div ref={badgesRef} className='flex flex-wrap items-center gap-2'>
                    {topBadges}
                  </div>
                )}
              </div>
              {topActions && (
                <div ref={actionsRef} className='flex flex-col items-end gap-2'>
                  {topActions}
                </div>
              )}
            </div>
          ) : (
            <>
              <div ref={headerRowRef} className='min-w-0'>
                <div ref={breadcrumbRef} className='min-w-0'>
                  <Breadcrumb items={breadcrumbItems} />
                </div>
              </div>

              {(topBadges || topActions) && (
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div
                    ref={badgesRef}
                    className='flex flex-wrap items-center gap-2 min-w-0'
                  >
                    {topBadges}
                  </div>
                  {topActions && (
                    <div ref={actionsRef} className='flex flex-col items-end gap-2'>
                      {topActions}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-2 mb-3'>
            <div>
              <Label size='sm' className='mb-1'>
                Název
              </Label>
              <Textarea
                value={nameValue}
                onChange={(e) => onNameChange?.(e.target.value)}
                disabled={disabled}
                minRows={1}
                maxRows={2}
                className={cn(
                  'font-semibold text-base md:text-lg opacity-100',
                  disabled && 'bg-muted/20 disabled:opacity-100',
                )}
              />
            </div>

            <div>
              <Label size='sm' className='mb-1'>
                Popis
              </Label>
              <Textarea
                value={descriptionValue ?? ''}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                disabled={disabled}
                minRows={1}
                maxRows={4}
                className={cn(
                  'opacity-100',
                  disabled && 'bg-muted/20 disabled:opacity-100',
                )}
              />
            </div>
          </div>

          <CardFooter className='flex flex-wrap justify-between sm:items-center gap-4 pt-3'>
            <div className='flex flex-row gap-7 md:gap-10'>
              <div>
                <Label size='sm' className='mb-1'>
                  Vytvořeno
                </Label>
                <p className='text-gray-900 font-medium'>
                  {fmtDate(createdAt)}
                </p>
              </div>
              {updatedAt &&
                createdAt &&
                new Date(createdAt).getTime() !==
                  new Date(updatedAt).getTime() && (
                  <div>
                    <Label size='sm' className='mb-1'>
                      Upraveno
                    </Label>
                    <p className='text-gray-900 font-medium'>
                      {fmtDate(updatedAt)}
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
