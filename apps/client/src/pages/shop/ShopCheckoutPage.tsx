import {
  createShopOrder,
  getShopCatalog,
  validateShopPromoCode,
} from '@/api/queries/shopQueries'
import playIcon from '@/assets/t-play-blue.svg'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildShopCartStorageKey, useShopCart } from '@/hooks/useShopCart'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import type { ApiError } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
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
  const { t, i18n } = useTranslation('shop')
  const uiLocale = i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'
  const { me } = useOrganizationAuth(orgSlug, {
    enabled: Boolean(orgSlug),
  })
  const cartStorageKey = buildShopCartStorageKey(
    orgSlug,
    me?.actorType === 'organization_user'
      ? me.id
      : me?.actorType === 'organization_admin'
        ? 'organization-admin'
        : null,
  )
  const { cart, clearCart } = useShopCart(cartStorageKey)
  const [contactEmail, setContactEmail] = useState('')

  const {
    data: catalog = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['shop-catalog', uiLocale],
    queryFn: getShopCatalog,
  })

  const promoValidation = useQuery({
    queryKey: [
      'shop-promo-validation',
      uiLocale,
      cart.promoCode.trim(),
      cart.items,
    ],
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
  const promoError = promoValidation.error as ApiError | null
  const promoErrorMessage =
    promoError?.body?.message ?? t('cart.promoValidationFailed')

  const createOrderMutation = useMutation({
    mutationFn: createShopOrder,
    onSuccess: (order) => {
      toast.success(t('checkout.orderCreated'))
      clearCart()
      navigate(buildShopPath(`/shop/success/${order.orderId}`, orgSlug), {
        state: { order },
      })
    },
    onError: (error: ApiError) => {
      toast.error(error?.body?.message ?? t('checkout.orderCreateFailed'))
    },
  })

  useTitle(t('checkout.pageTitle'))

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
        message={t('checkout.emptyCheckout')}
        onAction={() => navigate(buildShopPath('/shop', orgSlug))}
        actionText={t('checkout.goToShop')}
      />
    )
  }

  const submitOrder = () => {
    const trimmedEmail = contactEmail.trim()
    if (!trimmedEmail) {
      toast.error(t('checkout.missingEmail'))
      return
    }

    createOrderMutation.mutate({
      contactEmail: trimmedEmail,
      items: cart.items,
      promoCode: cart.promoCode.trim() || undefined,
    })
  }

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <section className='relative space-y-2 overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-4 shadow-sm sm:p-6'>
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
          className='absolute right-4 top-3 h-10 w-10 sm:right-6 sm:h-12 sm:w-12'
        />
        <div className='space-y-2'>
          <Label size='xl' className='-mt-1 font-bold'>
            {t('checkout.title')}
          </Label>
          <p className='text-sm text-muted-foreground'>
            {t('checkout.description')}
          </p>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[1.4fr_1fr]'>
        <section className='space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          <Label size='default'>{t('checkout.orderItems')}</Label>

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
                    {line.item?.name ?? t('checkout.unavailableItem')}
                  </p>
                  <div className='flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground'>
                    {t('checkout.quantity', { count: line.quantity })}
                    {line.item
                      ? (
                          <>
                            <span aria-hidden='true'>&bull;</span>
                            <span>
                              {t('cart.perUnit', {
                                price: formatPrice(line.item.unitPriceCents),
                              })}
                            </span>
                          </>
                        )
                      : ''}
                  </div>
                </div>
                <span className='font-semibold text-foreground'>
                  {formatPrice(line.lineTotalCents)}
                </span>
              </article>
            ))
          )}

          <div className='flex flex-col gap-2 border-t border-border/60 pt-4'>
            <label
              htmlFor='shop-checkout-email'
              className='text-sm font-medium text-foreground'
            >
              {t('checkout.contactEmail')}
            </label>
            <Input
              id='shop-checkout-email'
              type='email'
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder={t('checkout.contactEmailPlaceholder')}
            />
          </div>
        </section>

        <aside className='h-fit space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          <Label size='default'>{t('checkout.summaryTitle')}</Label>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('checkout.promoCode')}</span>
              <span
                className={cn(
                  cart.promoCode.trim()
                    ? 'font-semibold text-primary'
                    : 'text-destructive',
                )}
              >
                {cart.promoCode.trim() || t('checkout.promoUnused')}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('cart.discount')}</span>
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
              <span>{t('cart.total')}</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>

          {hasUnavailableItems && (
            <p className='text-xs text-destructive'>
              {t('checkout.unavailableItemsWarning')}
            </p>
          )}
          {cart.promoCode.trim().length > 0 &&
            promoValidation.isFetching && (
              <p className='text-xs text-muted-foreground'>
                {t('cart.promoValidating')}
              </p>
            )}
          {hasValidPromo && (
            <p className='text-xs font-medium text-primary'>
              {t('cart.promoActive')}
            </p>
          )}
          {cart.promoCode.trim().length > 0 &&
            !promoValidation.isFetching &&
            promoValidation.data?.valid === false && (
              <p className='text-xs text-destructive'>
                {t('cart.promoInvalidOrUsed')}
              </p>
            )}
          {promoError && (
            <p className='text-xs text-destructive'>{promoErrorMessage}</p>
          )}

          <div className='grid grid-cols-[40%_60%] gap-2'>
            <Button
              variant='outline'
              size='primary'
              onClick={() => navigate(buildShopPath('/shop/cart', orgSlug))}
              disabled={createOrderMutation.isPending}
            >
              <span className='sm:hidden'>{t('checkout.back')}</span>
              <span className='hidden sm:inline'>{t('checkout.backToCart')}</span>
            </Button>
            <Button
              variant='primary'
              size='primary'
              disabled={
                isLoading ||
                hasUnavailableItems ||
                createOrderMutation.isPending ||
                cart.items.length === 0
              }
              onClick={submitOrder}
            >
              {createOrderMutation.isPending
                ? t('checkout.submittingOrder')
                : t('checkout.confirmOrder')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ShopCheckoutPage
