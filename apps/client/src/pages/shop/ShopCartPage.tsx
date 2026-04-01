import {
  getShopCatalog,
  validateShopPromoCode,
} from '@/api/queries/shopQueries'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShopCart } from '@/hooks/useShopCart'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ApiError } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  buildShopPath,
  formatPrice,
  persistShopOrgSlug,
  resolveCartLines,
  resolveShopOrgSlug,
} from './shopUtils'
import EditBtn from '../dashboard/components/EditBtn'
import { useMediaQuery } from 'usehooks-ts'
import { Label } from '@/components/ui/label'

const ShopCartPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const isMd = useMediaQuery('(min-width: 768px)')

  const {
    cart,
    updateQuantity,
    removeItem,
    setPromoCode,
    itemCount,
    clearCart,
  } = useShopCart()
  const [promoDraft, setPromoDraft] = useState(cart.promoCode)

  const {
    data: catalog = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['shop-catalog'],
    queryFn: getShopCatalog,
  })

  const hasItems = cart.items.length > 0

  const promoValidation = useQuery({
    queryKey: ['shop-promo-validation', cart.promoCode.trim(), cart.items],
    queryFn: () =>
      validateShopPromoCode({
        code: cart.promoCode.trim(),
        items: cart.items,
      }),
    enabled: hasItems && cart.promoCode.trim().length > 0,
    retry: false,
  })

  useTitle('Košík | Platform Shop')
  useEffect(() => {
    persistShopOrgSlug(orgSlug)
  }, [orgSlug])

  const cartLines = resolveCartLines(cart.items, catalog)
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
    promoError?.body?.message ?? 'Promo kód se nepodařilo ověřit.'

  if (isError) {
    return <StateComp type='error' onAction={refetch} />
  }

  if (!isLoading && !hasItems) {
    return (
      <StateComp
        type='no-content'
        message='Košík je zatím prázdný.'
        onAction={() => navigate(buildShopPath('/shop', orgSlug))}
        actionText='Zpět do shopu'
      />
    )
  }

  const handleCheckout = () => {
    window.alert('Pro platbu a vyzvednutí se ozvěte na merch@tda.cz')
    clearCart()
    navigate(buildShopPath('/shop', orgSlug))
  }

  const handlePromoSubmit = () => {
    const normalizedPromoCode = promoDraft.toUpperCase().trim()
    setPromoDraft(normalizedPromoCode)
    setPromoCode(normalizedPromoCode)
  }

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      <section className='overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-4 sm:p-6 shadow-sm'>
        <div
          className={cn(
            headerLineHeight,
            colorStyles.line['accent-teal'],
            '-mx-4 -mt-4 mb-4 rounded-t-2xl sm:-mx-6 sm:-mt-6 sm:mb-6',
          )}
        />
        <div className='flex items-center justify-between gap-3'>
          <Label size={'xl'} className='font-bold mb-0'>
            Košík
          </Label>

          <Button
            variant='outline'
            size={'md'}
            onClick={() => navigate(buildShopPath('/shop', orgSlug))}
          >
            Pokračovat v nákupu
          </Button>
        </div>
      </section>

      <div className='grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5 md:gap-6'>
        <section className='rounded-2xl border border-border/70 bg-background p-4 sm:p-5 shadow-sm space-y-4'>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`cart-line-skeleton-${index}`}
                  className='h-24 rounded-xl bg-muted/30 animate-pulse'
                />
              ))}
            </div>
          ) : (
            cartLines.map((line) => (
              <article
                key={line.itemId}
                className='flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between'
              >
                {/* Лівий блок: фото + назва */}
                <div className='flex items-start justify-between gap-2 sm:items-center'>
                  <div className='flex items-center gap-2'>
                    {line.item?.imageUrl ? (
                      <img
                        src={line.item.imageUrl}
                        alt={line.item.name}
                        className='h-14 w-14 rounded-lg object-contain bg-muted/20 p-1 shrink-0'
                      />
                    ) : (
                      <div className='h-14 w-14 rounded-lg bg-muted/40 shrink-0' />
                    )}
                    <div>
                      <p className='font-semibold text-foreground'>
                        {line.item?.name ?? 'Položka již není dostupná'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {line.item
                          ? `${formatPrice(line.item.unitPriceCents)} / ks`
                          : 'Nelze nacenit'}
                      </p>
                    </div>
                  </div>

                  {/* Odebrat тільки на mobile */}
                  <EditBtn
                    type='delete'
                    onClick={() => {
                      removeItem(line.itemId)
                      toast.success(
                        `"${line.item?.name ?? 'Položka'}" byla odebrána z košíku.`,
                      )
                    }}
                    classNameBtn='flex sm:hidden'
                    iconClassName='size-4'
                  />
                </div>

                {/* Правий блок: стерлер + ціна/Odebrat */}
                <div
                  className='flex items-center justify-between gap-2 border-t border-border/50 pt-3
                  sm:border-none sm:pt-0 sm:flex-row sm:items-center sm:gap-4 shrink-0'
                >
                  {/* Стерлер */}
                  <div className='flex items-center gap-1.5 sm:gap-2'>
                    <Button
                      variant='outline'
                      size='icon-sm'
                      className='size-7 sm:size-8 rounded-xl'
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
                      className='h-8 w-11 sm:h-10 sm:w-15 text-center text-sm sm:text-base font-semibold px-1'
                    />
                    <Button
                      variant='outline'
                      size='icon-sm'
                      className='size-7 sm:size-8 rounded-xl'
                      onClick={() =>
                        updateQuantity(line.itemId, line.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  {/* Ціна + Odebrat на desktop — вертикально */}
                  <div className='flex items-center gap-2 sm:flex-col  sm:gap-1'>
                    <span className='font-semibold text-foreground'>
                      {formatPrice(line.lineTotalCents)}
                    </span>
                    <EditBtn
                      type='delete'
                      onClick={() => {
                        removeItem(line.itemId)
                        toast.success(
                          `"${line.item?.name ?? 'Položka'}" byla odebrána z košíku.`,
                        )
                      }}
                      label='Odebrat'
                      labelClassName='text-destructive text-xs sm:text-sm'
                      classNameBtn='hidden sm:flex'
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className='rounded-2xl border border-border/70 bg-background p-4 sm:p-5 shadow-sm space-y-4 h-fit'>
          <div className='flex items-center gap-2'>
            <ShoppingBag size={18} className='text-primary' />
            <Label size={'default'} className='font-semibold text-foreground'>
              Souhrn objednávky
            </Label>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Počet kusů</span>
              <span>{itemCount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Mezisoučet</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Sleva</span>
              <span
                className={
                  discountCents > 0
                    ? 'text-accent-teal-light font-semibold'
                    : ''
                }
              >
                -{formatPrice(discountCents)}
              </span>
            </div>
            <div className='border-t border-border/60 pt-2 flex items-center justify-between font-semibold text-base'>
              <span>Celkem</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-foreground'>
              Promo kód (1 kód na košík)
            </label>
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
              placeholder='Např. WELCOME10'
            />
            <p className='text-xs text-muted-foreground'>
              Pro ověření promo kódu stiskněte Enter.
            </p>
            {cart.promoCode.trim().length > 0 && promoValidation.isFetching && (
              <p className='text-xs text-muted-foreground'>
                Ověřuji promo kód...
              </p>
            )}
            {hasValidPromo && (
              <p className='text-xs text-primary font-medium'>
                Promo kód je aktivní. Sleva byla přepočítána.
              </p>
            )}
            {cart.promoCode.trim().length > 0 &&
              !promoValidation.isFetching &&
              promoValidation.data?.valid === false && (
                <p className='text-xs text-destructive'>
                  {promoValidation.data.message}
                </p>
              )}
            {promoError && (
              <p className='text-xs text-destructive'>{promoErrorMessage}</p>
            )}
          </div>

          <Button
            variant='primary'
            className='h-12 w-full text-base font-bold'
            onClick={() => navigate(buildShopPath('/shop/checkout', orgSlug))}
            disabled={!hasItems}
          >
            Pokračovat na checkout
          </Button>
        </aside>
      </div>
    </div>
  )
}

export default ShopCartPage
