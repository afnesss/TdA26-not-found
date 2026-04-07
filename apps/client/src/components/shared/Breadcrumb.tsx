import { useNavigate } from 'react-router'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { truncateDescription } from '@/pages/CoursePage/utils/helperFunctions'

type BreadcrumbItem = {
  label: string
  path?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <div className={cn('flex items-center gap-1 ', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <Fragment key={index}>
            <Button
              variant='link'
              className={cn(
                'w-fit text-accent-blue',
                !item.path && 'hover:no-underline pointer-events-none',
              )}
              onClick={() => (item.path ? navigate(item.path) : undefined)}
              aria-label={
                item.path ? t('breadcrumb.goTo', { label: item.label }) : item.label
              }
            >
              <span className='flex sm:hidden'>
                {truncateDescription(item.label, 15)}
              </span>
              <span className='hidden sm:flex'>{item.label}</span>
            </Button>

            {!isLast && (
              <ChevronRight
                className='text-accent-blue size-3 sm:mt-0.5 sm:size-4'
                aria-hidden='true'
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
