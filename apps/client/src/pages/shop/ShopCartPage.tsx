import { getShopCatalog, validateShopPromoCode } from '@/api/queries/shopQueries'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShopCart } from '@/hooks/useShopCart'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ApiError } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatPrice, resolveCartLines } from './shopUtils'

const ShopCartPage = () => {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeItem, setPromoCode, itemCount, clearCart } =
    useShopCart()

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
        onAction={() => navigate('/shop')}
        actionText='Zpět do shopu'
      />
    )
  }

  const handleCheckout = () => {
    window.alert('Pro platbu a vyzvednutí se ozvěte na merch@tda.cz')
    clearCart()
  }

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      <section className='rounded-2xl border border-border/70 bg-background/95 p-4 sm:p-6 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
              Košík
            </h1>
          </div>

          <Button variant='outline' onClick={() => navigate('/shop')}>
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
                className='flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/70 p-3'
              >
                {line.item?.imageUrl ? (
                  <img
                    src={line.item.imageUrl}
                    alt={line.item.name}
                    className='h-16 w-16 rounded-lg object-contain bg-muted/20 p-1'
                  />
                ) : (
                  <div className='h-16 w-16 rounded-lg bg-muted/40' />
                )}

                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-foreground'>
                    {line.item?.name ?? 'Položka již není dostupná'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {line.item
                      ? `${formatPrice(line.item.unitPriceCents)} / ks`
                      : 'Nelze nacenit'}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='icon-sm'
                    onClick={() =>
                      updateQuantity(line.itemId, Math.max(1, line.quantity - 1))
                    }
                  >
                    <Minus size={14} />
                  </Button>
                  <Input
                    type='number'
                    min={1}
                    max={99}
                    value={line.quantity}
                    onChange={(event) => {
                      updateQuantity(
                        line.itemId,
                        Number(event.target.value || line.quantity),
                      )
                    }}
                    className='w-16 text-center'
                  />
                  <Button
                    variant='outline'
                    size='icon-sm'
                    onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <div className='flex items-center justify-between gap-3 sm:flex-col sm:items-end'>
                  <span className='font-semibold text-foreground'>
                    {formatPrice(line.lineTotalCents)}
                  </span>
                  <Button
                    variant='ghost'
                    className='text-destructive hover:text-destructive'
                    onClick={() => removeItem(line.itemId)}
                  >
                    <Trash2 size={16} />
                    Odebrat
                  </Button>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className='rounded-2xl border border-border/70 bg-background p-4 sm:p-5 shadow-sm space-y-4 h-fit'>
          <div className='flex items-center gap-2'>
            <ShoppingBag size={18} className='text-primary' />
            <h2 className='font-semibold text-foreground'>Souhrn objednávky</h2>
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
              <span className={discountCents > 0 ? 'text-primary font-semibold' : ''}>
                -{formatPrice(discountCents)}
              </span>
            </div>
            <div className='border-t border-border/60 pt-2 flex items-center justify-between font-semibold text-base'>
              <span>Celkem</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Promo kód (1 kód na košík)
            </label>
            <Input
              value={cart.promoCode}
              onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
              placeholder='Např. WELCOME10'
            />
            {cart.promoCode.trim().length > 0 && promoValidation.isFetching && (
              <p className='text-xs text-muted-foreground'>Ověřuji promo kód...</p>
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
            className='w-full'
            onClick={handleCheckout}
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
