import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/courses')
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] px-4'>
      <div className='text-center space-y-6 max-w-md'>
        <h1 className='text-7xl font-bold text-destructive'>404</h1>

        <div className='space-y-2'>
          <h2 className='text-3xl font-semibold text-foreground'>
            Hmm... Tato stránka nebyla nalezena
          </h2>
          <p className='text-muted-foreground text-lg'>
            Stránka, kterou hledáte, neexistuje nebo byla odstraněná.
          </p>
        </div>

        <Button
          variant='primary'
          size='primary'
          onClick={handleGoBack}
          className='gap-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Zpět na přehled kurzů
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
