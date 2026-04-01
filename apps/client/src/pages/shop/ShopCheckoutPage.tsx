import {
  createShopOrder,
  getShopCatalog,
  validateShopPromoCode,
} from '@/api/queries/shopQueries'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShopCart } from '@/hooks/useShopCart'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ApiError } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import playIcon from '@/assets/t-play-blue.svg'
import {
  buildShopPath,
  formatPrice,
  persistShopOrgSlug,
  resolveCartLines,
  resolveShopOrgSlug,
} from './shopUtils'

const ShopCheckoutPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const { cart, clearCart } = useShopCart()
  const [contactEmail, setContactEmail] = useState('')

  const {
    data: catalog = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['shop-catalog'],
    queryFn: getShopCatalog,
  })

  const promoValidation = useQuery({
    queryKey: ['shop-promo-validation', cart.promoCode.trim(), cart.items],
    queryFn: () =>
      validateShopPromoCode({
        code: cart.promoCode.trim(),
        items: cart.items,
      }),
    enabled: cart.items.length > 0 && cart.promoCode.trim().length > 0,
    retry: false,
  })

  const cartLines = useMemo(
    () => resolveCartLines(cart.items, catalog),
    [cart.items, catalog],
  )

  const hasUnavailableItems = cartLines.some((line) => !line.item)
  const subtotalCents = cartLines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  )
  const hasValidPromo =
    cart.promoCode.trim().length > 0 && promoValidation.data?.valid === true
  const discountCents = hasValidPromo
    ? (promoValidation.data?.discountCents ?? 0)
    : 0
  const totalCents = Math.max(0, subtotalCents - discountCents)

  const createOrderMutation = useMutation({
    mutationFn: createShopOrder,
    onSuccess: (order) => {
      toast.success('Objednávka byla úspěšně vytvořena.')
      clearCart()
      navigate(buildShopPath(`/shop/success/${order.orderId}`, orgSlug), {
        state: { order },
      })
    },
    onError: (error: ApiError) => {
      toast.error(error?.body?.message ?? 'Objednávku se nepodařilo vytvořit.')
    },
  })

  useTitle('Checkout | Platform Shop')

  useEffect(() => {
    persistShopOrgSlug(orgSlug)
  }, [orgSlug])

  if (isError) {
    return <StateComp type='error' onAction={refetch} />
  }

  if (!isLoading && cart.items.length === 0) {
    return (
      <StateComp
        type='no-content'
        message='Košík je prázdný, checkout není možné dokončit.'
        onAction={() => navigate(buildShopPath('/shop', orgSlug))}
        actionText='Přejít do shopu'
      />
    )
  }

  const submitOrder = () => {
    const trimmedEmail = contactEmail.trim()
    if (!trimmedEmail) {
      toast.error('Vyplňte prosím kontaktní e-mail.')
      return
    }

    createOrderMutation.mutate({
      contactEmail: trimmedEmail,
      items: cart.items,
      promoCode: cart.promoCode.trim() || undefined,
    })
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6'>
      <section className='relative overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-4 sm:p-6 shadow-sm space-y-2'>
        <div
          className={cn(
            headerLineHeight,
            colorStyles.line['accent-teal'],
            '-mx-4 -mt-4 mb-4 rounded-t-2xl sm:-mx-6 sm:-mt-6 sm:mb-6',
          )}
        />

        <img
          src={playIcon}
          alt=''
          aria-hidden='true'
          className='absolute top-3 right-4 h-10 w-10 sm:right-6 sm:h-12 sm:w-12'
        />
        <div className='space-y-2 '>
          <Label size='xl' className='font-bold -mt-1'>
            Checkout
          </Label>
          <p className='text-sm text-muted-foreground'>
            V1 checkout je záměrně jednoduchý: objednávka se odešle pouze s
            kontaktním e-mailem.
          </p>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[1.4fr_1fr]'>
        <section className='space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          <Label size={'default'}>Položky objednávky</Label>

          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`checkout-skeleton-${index}`}
                  className='h-18 animate-pulse rounded-xl bg-muted/30'
                />
              ))}
            </div>
          ) : (
            cartLines.map((line) => (
              <article
                key={line.itemId}
                className='flex items-center justify-between rounded-xl border border-border/70 p-3'
              >
                <div>
                  <p className='font-medium text-foreground'>
                    {line.item?.name ?? 'Nedostupná položka'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {line.quantity} ks
                    {line.item
                      ? ` • ${formatPrice(line.item.unitPriceCents)} / ks`
                      : ''}
                  </p>
                </div>
                <span className='font-semibold text-foreground'>
                  {formatPrice(line.lineTotalCents)}
                </span>
              </article>
            ))
          )}

          <div className='flex flex-col gap-2 pt-2 border-t border-border/60'>
            <label
              htmlFor='shop-checkout-email'
              className='text-sm font-medium text-foreground'
            >
              Kontaktní e-mail
            </label>
            <Input
              id='shop-checkout-email'
              type='email'
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder='napr. jmeno@example.com'
            />
          </div>
        </section>

        <aside className='h-fit space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          <Label size={'default'}>Rekapitulace</Label>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Mezisoučet</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Promo kód</span>
              <span
                className={cn(
                  cart.promoCode.trim()
                    ? 'font-semibold text-primary'
                    : 'text-destructive',
                )}
              >
                {cart.promoCode.trim() || 'Nepoužit'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Sleva</span>
              <span
                className={
                  discountCents > 0
                    ? 'font-semibold text-accent-teal-light'
                    : ''
                }
              >
                -{formatPrice(discountCents)}
              </span>
            </div>
            <div className='flex items-center justify-between border-t border-border/60 pt-2 text-base font-semibold'>
              <span>Celkem</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>

          {hasUnavailableItems && (
            <p className='text-xs text-destructive'>
              V košíku jsou položky, které už nejsou dostupné. Vraťte se prosím
              do košíku a upravte objednávku.
            </p>
          )}
          {cart.promoCode.trim().length > 0 &&
            !promoValidation.isFetching &&
            promoValidation.data?.valid === false && (
              <p className='text-xs text-destructive'>
                {promoValidation.data.message}
              </p>
            )}

          <div className='grid grid-cols-[40%_60%] gap-2'>
            <Button
              variant='outline'
              size={'primary'}
              onClick={() => navigate(buildShopPath('/shop/cart', orgSlug))}
              disabled={createOrderMutation.isPending}
            >
              <span className='sm:hidden'>Zpět</span>
              <span className='hidden sm:inline'>Zpět do košíku</span>
            </Button>
            <Button
              variant='primary'
              size={'primary'}
              disabled={
                isLoading ||
                hasUnavailableItems ||
                createOrderMutation.isPending ||
                cart.items.length === 0
              }
              onClick={submitOrder}
            >
              {createOrderMutation.isPending
                ? 'Odesílám objednávku...'
                : 'Potvrdit objednávku'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ShopCheckoutPage
