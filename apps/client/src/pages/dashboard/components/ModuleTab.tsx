import { Button } from '@/components/ui/button'
import type { ModuleSummary } from '@/lib/schemas/module'
import { cn } from '@/lib/utils'
import { useNavigate, useParams } from 'react-router-dom'

type ModuleTabProps = {
  module: ModuleSummary
  index: number
  liveModuleVisibility: boolean
}

const UserModuleTab = ({
  module,
  index,
}: {
  module: ModuleSummary
  index: number
}) => {
  const navigate = useNavigate()
  const { courseId, moduleId } = useParams<{
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
      )}
      onClick={() => navigate(`/courses/${courseId}/${module.uuid}`)}
    >
      <span className='inline-flex items-center gap-2'>
        <span
          className={cn('text-xs', moduleId === module.uuid && 'opacity-90')}
        >
          {index + 1}.
        </span>
        <span className='max-w-44 truncate'>{module.name}</span>
      </span>
    </Button>
  )
}

export default UserModuleTab
