import { getAdminShopOrders } from '@/api/queries/shopQueries'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/pages/shop/shopUtils'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Globe, Mail, PackageSearch, ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const customerTypeTone = {
  guest: 'bg-muted text-muted-foreground',
  lecturer: 'bg-primary/20 text-primary',
  student: 'bg-secondary/45 text-[#2D8B6B]',
} as const

const customerTypeLineTone = {
  guest: colorStyles.line.gray,
  lecturer: colorStyles.line.primary,
  student: colorStyles.line.secondary,
} as const

const formatCompactDate = (value: string | Date) => {
  const date = new Date(value)
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

const iconBubbleClassName =
  'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'

const AdminOrdersPage = () => {
  const { t } = useTranslation('admin')
  useTitle(t('orders.pageTitle'))

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getAdminShopOrders,
  })

  if (isLoading) {
    return <StateComp type='no-content' message={t('orders.loading')} />
  }

  if (isError || !data) {
    return <StateComp type='error' onAction={() => void refetch()} />
  }

  if (data.length === 0) {
    return (
      <div className='mx-auto max-w-7xl'>
        <StateComp type='no-content' message={t('orders.empty')} />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl space-y-5 md:space-y-6'>
      <HintPageText
        text={t('orders.heading')}
        icon={PackageSearch}
        spanText={String(data.length)}
      />

      <div className='grid gap-4'>
        {data.map((order) => (
          <Card
            key={order.orderId}
            className='overflow-hidden rounded-xl border border-border/60 bg-background shadow-md'
          >
            <div
              className={cn(
                headerLineHeight,
                customerTypeLineTone[order.customerType],
              )}
            />

            <CardContent className='space-y-4 px-5 py-4'>
              <div className='w-full'>
                <div className='min-w-0 space-y-3'>
                  <div className='flex justify-between'>
                    <div className='flex flex-wrap items-center gap-2.5'>
                      <h2 className='text-lg font-bold leading-tight text-foreground md:text-xl'>
                        {order.customerName || t('orders.unknownCustomer')}
                      </h2>
                      <Badge
                        variant='secondary'
                        className={customerTypeTone[order.customerType]}
                      >
                        {t(`orders.customerTypes.${order.customerType}`)}
                      </Badge>
                      {order.interfaceLanguage ? (
                        <Badge variant='outline' className='h-7 lowercase'>
                          {order.interfaceLanguage}
                        </Badge>
                      ) : null}
                    </div>
                    <div className='shrink-0 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground'>
                      #{order.orderId.slice(0, 8)}
                    </div>
                  </div>

                  <div className='grid gap-2 md:grid-cols-3'>
                    <div className='flex items-center gap-2.5 rounded-2xl bg-muted/60 px-3 py-2'>
                      <div className={iconBubbleClassName}>
                        <Globe className='size-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
                          {t('orders.organization')}
                        </p>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {order.organizationName || t('orders.notProvided')}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2.5 rounded-2xl bg-muted/60 px-3 py-2'>
                      <div className={iconBubbleClassName}>
                        <Mail className='size-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
                          {t('orders.contactEmail')}
                        </p>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {order.contactEmail}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2.5 rounded-2xl bg-muted/60 px-3 py-2'>
                      <div className={iconBubbleClassName}>
                        <Calendar className='size-4' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
                          {t('orders.createdAt')}
                        </p>
                        <p className='text-sm font-semibold text-foreground'>
                          {formatCompactDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='w-full'>
                <section className='rounded-2xl '>
                  <div className='grid gap-4 xl:grid-cols-2 xl:gap-5'>
                    <div className='space-y-2'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Label size={'lg'}>{t('orders.items')}</Label>
                      </div>
                      {order.items.map((item) => (
                        <div
                          key={`${order.orderId}-${item.merchItemId}`}
                          className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl  border border-muted-foreground/20 px-3 py-2.5'
                        >
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-foreground'>
                              {item.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatPrice(item.unitPriceCents)} ×{' '}
                              {item.quantity}
                            </p>
                          </div>
                          <div className='text-right text-sm font-semibold text-foreground'>
                            {formatPrice(item.lineTotalCents)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='text-sm'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Label size={'lg'}>{t('orders.summary')}</Label>
                      </div>
                      <div className='rounded-2xl space-y-3 bg-muted/50 px-4 py-4'>
                        <div className='flex items-center justify-between  gap-3'>
                          <span className='text-muted-foreground'>
                            {t('orders.subtotal')}
                          </span>
                          <span className='font-medium text-foreground'>
                            {formatPrice(order.subtotalCents)}
                          </span>
                        </div>
                    <div className='flex items-center justify-between gap-3'>
                      <span className='text-muted-foreground'>
                        {t('orders.discount')}
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          order.discountCents > 0
                            ? 'text-accent-teal-light'
                            : 'text-destructive',
                        )}
                      >
                        {order.discountCents > 0
                          ? `-${formatPrice(order.discountCents)}`
                          : t('orders.notUsed')}
                      </span>
                    </div>
                        <div className='h-px bg-border/70' />
                        <div className='flex items-center justify-between gap-3'>
                          <span className='font-semibold text-foreground'>
                            {t('orders.total')}
                          </span>
                          <span className='text-lg font-semibold text-foreground'>
                            {formatPrice(order.totalCents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminOrdersPage
