import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  useTitle(t('notFoundPage.pageTitle'))

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] px-4'>
      <div className='text-center space-y-6 max-w-md'>
        <h1 className='text-7xl font-bold text-destructive'>404</h1>

        <div className='space-y-2'>
          <h2 className='text-3xl font-semibold text-foreground'>
            {t('notFoundPage.title')}
          </h2>
          <p className='text-muted-foreground text-lg'>
            {t('notFoundPage.description')}
          </p>
        </div>

        <Button
          variant='primary'
          size='primary'
          onClick={() => navigate(-1)}
          className='gap-2'
        >
          <ArrowLeft className='w-4 h-4' />
          {t('notFoundPage.goBack')}
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
