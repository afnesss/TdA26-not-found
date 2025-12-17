import { Button } from './components/ui/button'
import { Card } from './components/ui/card'

function App() {
  return (
    <Card className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
      <h2 className='text-2xl font-bold text-gray-800'>Tailwind Card</h2>
      <p className='text-gray-600 mt-3'>
        This is a simple card layout built with Tailwind CSS and shadcn.
      </p>
      <Button variant='default'>Button text</Button>
    </Card>
  )
}

export default App
