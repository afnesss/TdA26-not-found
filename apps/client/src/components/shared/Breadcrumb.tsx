import { useNavigate } from 'react-router'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'

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

  return (
    <div className={cn('flex items-center gap-1 ', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <Fragment key={index}>
            <Button
              variant='link'
              className={cn(
                ' w-fit text-accent-blue',
                !item.path && 'hover:no-underline pointer-events-none',
              )}
              onClick={() => (item.path ? navigate(item.path) : undefined)}
            >
              <span>{item.label}</span>
            </Button>

            {!isLast && (
              <ChevronRight className='text-accent-blue size-3 sm:mt-0.5 sm:size-4' />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
