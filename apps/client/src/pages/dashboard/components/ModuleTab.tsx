import { Button } from '@/components/ui/button'
import {
  buildOrgDashboardModulePath,
  buildOrgModulePath,
} from '@/lib/routes'
import type { ModuleSummary } from '@/lib/schemas/module'
import { cn } from '@/lib/utils'
import { useNavigate, useParams } from 'react-router-dom'

type ModuleTabProps = {
  module: ModuleSummary
  index: number
  path?: string
}

const UserModuleTab = ({ module, index, path = 'courses' }: ModuleTabProps) => {
  const navigate = useNavigate()
  const { orgSlug, courseId, moduleId } = useParams<{
    orgSlug?: string
    courseId: string
    moduleId?: string
  }>()

  return (
    <Button
      variant='filter'
      size='sm'
      className={cn(
        'whitespace-nowrap rounded-xl',
        moduleId === module.uuid
          ? 'bg-primary text-background shadow-md'
          : 'bg-background text-primary hover:bg-gray-50 border border-gray-200',
        'max-sm:w-8 ',
      )}
      onClick={() => {
        if (!courseId) return

        navigate(
          path === 'dashboard'
            ? buildOrgDashboardModulePath(orgSlug, courseId, module.uuid)
            : buildOrgModulePath(orgSlug, courseId, module.uuid),
        )
      }}
    >
      <span className='inline-flex items-center gap-2'>
        <span
          className={cn('text-xs', moduleId === module.uuid && 'opacity-90')}
        >
          {index + 1}.
        </span>
        <span className='hidden md:block max-w-20 truncate'>{module.name}</span>
      </span>
    </Button>
  )
}

export default UserModuleTab
