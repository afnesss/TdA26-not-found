import { Button } from '@/components/ui/button'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursesPath } from '@/lib/routes'
import type { ShopOrder } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  buildShopPath,
  formatPrice,
  persistShopOrgSlug,
  resolveShopOrgSlug,
} from './shopUtils'
import { Label } from '@/components/ui/label'

type ShopSuccessLocationState = {
  order?: ShopOrder
}

const ShopSuccessPage = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const location = useLocation()
  const state = location.state as ShopSuccessLocationState | null
  const order = state?.order

  useTitle('Objednávka vytvořena | Platform Shop')
  useEffect(() => {
    persistShopOrgSlug(orgSlug)
  }, [orgSlug])

  return (
    <div className='w-full max-w-3xl mx-auto'>
      <section className='overflow-hidden rounded-2xl border border-border/70 bg-background p-5 sm:p-8 shadow-sm text-center space-y-5'>
        <div
          className={cn(
            headerLineHeight,
            colorStyles.line.secondary,
            '-mx-5 -mt-5 mb-5 rounded-t-2xl sm:-mx-8 sm:-mt-8 sm:mb-8',
          )}
        />

        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/45 text-[#2D8B6B]'>
          <CheckCircle2 size={34} />
        </div>

        <div className='space-y-2'>
          <Label size={'xl'} className='font-bold'>
            Objednávka byla vytvořena
          </Label>
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
                <span>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className='flex items-center justify-between gap-2 text-sm font-semibold'>
                <span>Celkem</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button
            variant='primary'
            className='h-13 px-8 text-base sm:text-lg font-bold'
            onClick={() => navigate(buildShopPath('/shop', orgSlug))}
          >
            Zpět do shopu
          </Button>
          <Button
            variant='outline'
            className='h-13 px-8 text-base sm:text-lg font-semibold'
            onClick={() =>
              navigate(
                orgSlug
                  ? buildOrgCoursesPath(orgSlug)
                  : buildShopPath('/shop', orgSlug),
              )
            }
          >
            Přejít na kurzy
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ShopSuccessPage
