import type { CourseModule } from '@/lib/schemas/module'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { fmt } from '@/pages/CoursePage/utils/helperFunctions'
import type { ReactNode } from 'react'
import { Label } from '../ui/label'

type CourseModulesGridProps = {
  modules: CourseModule[]
  onOpenModule?: (moduleId: string) => void
  renderActions?: (module: CourseModule) => ReactNode
  getIndexBadgeClassName?: (module: CourseModule, index: number) => string
  cardClassName?: string
}

const CourseModulesGrid = ({
  modules,
  onOpenModule,
  renderActions,
  getIndexBadgeClassName,
  cardClassName,
}: CourseModulesGridProps) => {
  const isCardClickable = Boolean(onOpenModule)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {modules.map((m, i) => (
        <Card
          key={m.uuid}
          className={cn(
            'border border-border/60 shadow-md bg-background',
            isCardClickable && 'cursor-pointer',
            cardClassName,
          )}
          onClick={onOpenModule ? () => onOpenModule(m.uuid) : undefined}
          role={isCardClickable ? 'button' : undefined}
          tabIndex={isCardClickable ? 0 : undefined}
          onKeyDown={
            onOpenModule
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenModule(m.uuid)
                  }
                }
              : undefined
          }
        >
          <div className='p-3 md:px-5 md:py-4 h-full flex flex-col'>
            <div className='flex items-center justify-between gap-3'>
              <div className='min-w-0 flex items-center gap-2'>
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-foreground font-medium shrink-0',
                    getIndexBadgeClassName?.(m, i) ?? 'bg-primary/30',
                  )}
                >
                  {i + 1}
                </span>
                <Label className='font-bold min-w-0' size='md'>
                  <span className='block truncate'>{m.name}</span>
                </Label>
              </div>

              {renderActions ? (
                <div className='flex shrink-0 items-center gap-2'>
                  {renderActions(m)}
                </div>
              ) : null}
            </div>

            <p className='w-full text-xs md:text-sm text-muted-foreground line-clamp-3 mt-1 mb-2 md:mb-3'>
              {m.description || 'Bez popisu modulu'}
            </p>

            <div className='flex items-center justify-between gap-10 pt-2 border-t border-border/60'>
              <div className='mt-auto text-xs md:text-sm flex gap-5'>
                <p className='text-muted-foreground'>
                  Materiály:{' '}
                  <span className='font-semibold text-neutral-black'>
                    {m.materials.length}
                  </span>
                </p>
                <p className='text-muted-foreground'>
                  Kvízy:{' '}
                  <span className='font-semibold text-neutral-black'>
                    {m.quizzes.length}
                  </span>
                </p>
              </div>
              {m.updatedAt && m.updatedAt !== m.createdAt && (
                <span className='text-[10px] md:text-xs text-muted-foreground/60 italic'>
                  upraveno {fmt(String(m.updatedAt))}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default CourseModulesGrid
