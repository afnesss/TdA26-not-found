import {
  getShopCatalog,
  validateShopPromoCode,
} from '@/api/queries/shopQueries'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildShopCartStorageKey, useShopCart } from '@/hooks/useShopCart'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import type { ApiError } from '@/lib/types'
import { getAssetUrl } from '@/lib/assetUrl'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import EditBtn from '../dashboard/components/EditBtn'
import {
  buildShopPath,
  formatPrice,
  persistShopAdminContext,
  persistShopOrgSlug,
  resolveCartLines,
  resolveShopAdminContext,
  resolveShopOrgSlug,
} from './shopUtils'

const ShopCartPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const isAdminContextPage = resolveShopAdminContext(searchParams.get('admin'))
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

  const { cart, updateQuantity, removeItem, setPromoCode, itemCount } =
    useShopCart(cartStorageKey)
  const [promoDraft, setPromoDraft] = useState(cart.promoCode)

  const {
    data: catalog = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['shop-catalog', uiLocale],
    queryFn: getShopCatalog,
  })

  const hasItems = cart.items.length > 0

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
    enabled: hasItems && cart.promoCode.trim().length > 0,
    retry: false,
  })

  useTitle(t('cart.pageTitle'))

  useEffect(() => {
    persistShopOrgSlug(orgSlug)
    persistShopAdminContext(isAdminContextPage)
  }, [isAdminContextPage, orgSlug])

  const cartLines = resolveCartLines(cart.items, catalog)
  useEffect(() => {
    if (cartLines.length === 0) {
      navigate(buildShopPath('/shop', orgSlug, isAdminContextPage))
    }
  }, [hasItems])
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

  if (isError) {
    return <StateComp type='error' onAction={refetch} />
  }

  const handlePromoSubmit = () => {
    const normalizedPromoCode = promoDraft.toUpperCase().trim()
    setPromoDraft(normalizedPromoCode)
    setPromoCode(normalizedPromoCode)
  }

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <section className='overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-4 shadow-sm sm:p-6'>
        <div
          className={cn(
            headerLineHeight,
            colorStyles.line['accent-teal'],
            '-mx-4 -mt-4 mb-4 rounded-t-2xl sm:-mx-6 sm:-mt-6 sm:mb-6',
          )}
        />
        <div className='flex items-center justify-between gap-3'>
          <Label size='xl' className='mb-0 font-bold'>
            {t('cart.title')}
          </Label>

          <Button
            variant='outline'
            size='md'
            onClick={() => navigate(buildShopPath('/shop', orgSlug, isAdminContextPage))}
          >
            {t('cart.continueShopping')}
          </Button>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-[1.7fr_1fr]'>
        <section className='space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`cart-line-skeleton-${index}`}
                  className='h-24 animate-pulse rounded-xl bg-muted/30'
                />
              ))}
            </div>
          ) : (
            cartLines.map((line) => (
              <article
                key={line.itemId}
                className='flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='flex items-start justify-between gap-2 sm:items-center'>
                  <div className='flex items-center gap-2'>
                    {line.item?.imageUrl ? (
                      <img
                        src={getAssetUrl(line.item.imageUrl)}
                        alt={line.item.name}
                        className='h-14 w-14 shrink-0 rounded-lg bg-muted/20 p-1 object-contain'
                      />
                    ) : (
                      <div className='h-14 w-14 shrink-0 rounded-lg bg-muted/40' />
                    )}
                    <div>
                      <p className='font-semibold text-foreground'>
                        {line.item?.name ?? t('cart.unavailableItem')}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {line.item
                          ? t('cart.perUnit', {
                              price: formatPrice(line.item.unitPriceCents),
                            })
                          : t('cart.cannotPrice')}
                      </p>
                    </div>
                  </div>

                  <EditBtn
                    actionType='delete'
                    onClick={() => {
                      removeItem(line.itemId)
                      toast.success(
                        t('cart.itemRemoved', {
                          name: line.item?.name ?? t('cart.fallbackItemName'),
                        }),
                      )
                    }}
                    classNameBtn='flex sm:hidden'
                    iconClassName='size-4'
                  />
                </div>

                <div className='flex shrink-0 items-center justify-between gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:gap-4 sm:border-none sm:pt-0'>
                  <div className='flex items-center gap-1.5 sm:gap-2'>
                    <Button
                      variant='outline'
                      size='icon-sm'
                      className='size-7 rounded-xl sm:size-8'
                      disabled={line.quantity === 1}
                      onClick={() =>
                        updateQuantity(
                          line.itemId,
                          Math.max(1, line.quantity - 1),
                        )
                      }
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      type='text'
                      inputMode='numeric'
                      min={1}
                      max={50}
                      value={line.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          line.itemId,
                          Number(event.target.value || line.quantity),
                        )
                      }
                      className='h-8 w-11 px-1 text-center text-sm font-semibold sm:h-10 sm:w-15 sm:text-base'
                    />
                    <Button
                      variant='outline'
                      size='icon-sm'
                      className='size-7 rounded-xl sm:size-8'
                      onClick={() =>
                        updateQuantity(line.itemId, line.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  <div className='flex items-center gap-2 sm:flex-col sm:gap-1'>
                    <span className='font-semibold text-foreground'>
                      {formatPrice(line.lineTotalCents)}
                    </span>
                    <EditBtn
                      actionType='delete'
                      onClick={() => {
                        removeItem(line.itemId)
                        toast.success(
                          t('cart.itemRemoved', {
                            name: line.item?.name ?? t('cart.fallbackItemName'),
                          }),
                        )
                      }}
                      label={t('cart.remove')}
                      labelClassName='text-destructive text-xs sm:text-sm'
                      classNameBtn='hidden sm:flex'
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className='h-fit space-y-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-5'>
          <div className='flex items-center gap-2'>
            <ShoppingBag size={18} className='text-primary' />
            <Label size='default' className='font-semibold text-foreground'>
              {t('cart.summaryTitle')}
            </Label>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {t('cart.itemCount')}
              </span>
              <span>{itemCount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {t('cart.subtotal')}
              </span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {t('cart.discount')}
              </span>
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

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-foreground'>
              {t('cart.promoLabel')}
            </label>
            <div className='relative'>
              <Input
                value={promoDraft}
                onChange={(event) =>
                  setPromoDraft(event.target.value.toUpperCase())
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handlePromoSubmit()
                  }
                }}
                placeholder={t('cart.promoPlaceholder')}
                className='pr-24'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='absolute right-1 top-1 h-8 rounded-lg px-3'
                onClick={handlePromoSubmit}
                disabled={!promoDraft.trim() || promoValidation.isFetching}
              >
                {t('cart.applyPromo')}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('cart.promoHint')}
            </p>
            {cart.promoCode.trim().length > 0 && promoValidation.isFetching && (
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
          </div>

          <Button
            variant='primary'
            className='h-12 w-full text-base font-bold'
            onClick={() =>
              navigate(buildShopPath('/shop/checkout', orgSlug, isAdminContextPage))
            }
            disabled={!hasItems}
          >
            {t('cart.proceedToCheckout')}
          </Button>
        </aside>
      </div>
    </div>
  )
}

export default ShopCartPage
