import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursesPath } from '@/lib/routes'
import type { ShopOrder } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

type ShopSuccessLocationState = {
  order?: ShopOrder
}

const ShopSuccessPage = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const { t } = useTranslation('shop')
  const location = useLocation()
  const state = location.state as ShopSuccessLocationState | null
  const order = state?.order

  useTitle(t('success.pageTitle'))

  useEffect(() => {
    persistShopOrgSlug(orgSlug)
  }, [orgSlug])

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <section className='space-y-5 overflow-hidden rounded-2xl border border-border/70 bg-background p-5 text-center shadow-sm sm:p-8'>
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
          <Label size='xl' className='font-bold'>
            {t('success.title')}
          </Label>
          <p className='text-sm text-muted-foreground'>
            {t('success.description')}
          </p>
        </div>

        <div className='space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-left'>
          <div className='flex items-center justify-between gap-2 text-sm'>
            <span className='text-muted-foreground'>{t('success.orderId')}</span>
            <span className='font-mono text-xs sm:text-sm'>{orderId}</span>
          </div>

          {order && (
            <>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='text-muted-foreground'>
                  {t('success.contactEmail')}
                </span>
                <span>{order.contactEmail}</span>
              </div>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='text-muted-foreground'>
                  {t('success.itemCount')}
                </span>
                <span>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className='flex items-center justify-between gap-2 text-sm font-semibold'>
                <span>{t('success.total')}</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </>
          )}
        </div>

        <div className='flex flex-col justify-center gap-3 sm:flex-row'>
          <Button
            variant='primary'
            className='h-13 px-8 text-base font-bold sm:text-lg'
            onClick={() => navigate(buildShopPath('/shop', orgSlug))}
          >
            {t('success.backToShop')}
          </Button>
          <Button
            variant='outline'
            className='h-13 px-8 text-base font-semibold sm:text-lg'
            onClick={() =>
              navigate(
                orgSlug
                  ? buildOrgCoursesPath(orgSlug)
                  : buildShopPath('/shop', orgSlug),
              )
            }
          >
            {t('success.goToCourses')}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ShopSuccessPage
