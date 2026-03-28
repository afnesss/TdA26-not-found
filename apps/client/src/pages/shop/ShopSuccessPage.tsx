import { Button } from '@/components/ui/button'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ShopOrder } from '@/lib/schemas'
import { CheckCircle2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { formatPrice } from './shopUtils'

type ShopSuccessLocationState = {
  order?: ShopOrder
}

const ShopSuccessPage = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const location = useLocation()
  const state = location.state as ShopSuccessLocationState | null
  const order = state?.order

  useTitle('Objednávka vytvořena | Platform Shop')

  return (
    <div className='w-full max-w-3xl mx-auto'>
      <section className='rounded-2xl border border-border/70 bg-background p-5 sm:p-8 shadow-sm text-center space-y-5'>
        <div className='mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
          <CheckCircle2 size={34} />
        </div>

        <div className='space-y-2'>
          <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
            Objednávka byla vytvořena
          </h1>
          <p className='text-sm text-muted-foreground'>
            Děkujeme. Objednávka byla automaticky uložena v systému.
          </p>
        </div>

        <div className='rounded-xl border border-border/60 bg-muted/20 p-4 text-left space-y-2'>
          <div className='flex items-center justify-between gap-2 text-sm'>
            <span className='text-muted-foreground'>ID objednávky</span>
            <span className='font-mono text-xs sm:text-sm'>{orderId}</span>
          </div>

          {order && (
            <>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='text-muted-foreground'>Kontaktní e-mail</span>
                <span>{order.contactEmail}</span>
              </div>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='text-muted-foreground'>Počet položek</span>
                <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className='flex items-center justify-between gap-2 text-sm font-semibold'>
                <span>Celkem</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button variant='primary' onClick={() => navigate('/shop')}>
            Zpět do shopu
          </Button>
          <Button variant='outline' onClick={() => navigate('/courses')}>
            Přejít na kurzy
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ShopSuccessPage
