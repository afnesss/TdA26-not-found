import { getShopCatalog, purchaseShopVoucher } from '@/api/queries/shopQueries'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { useShopCart } from '@/hooks/useShopCart'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgLoginPath } from '@/lib/routes'
import type { ApiError } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  buildShopPath,
  formatPrice,
  persistShopOrgSlug,
  resolveCartLines,
  resolveShopOrgSlug,
} from './shopUtils'

const ShopCatalogPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const queryClient = useQueryClient()
  const { isAuth: isOrgAuth, user } = useOrganizationAuth(orgSlug, {
    enabled: Boolean(orgSlug),
  })
  const { cart, addItem, itemCount } = useShopCart()
  const {
    data: catalog = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['shop-catalog'],
    queryFn: getShopCatalog,
  })

  useTitle('Platform Shop')
  useEffect(() => {
    persistShopOrgSlug(orgSlug)
  }, [orgSlug])

  const purchaseVoucherMutation = useMutation({
    mutationFn: purchaseShopVoucher,
    onSuccess: (response) => {
      if (orgSlug) {
        queryClient.setQueryData(['org-auth', orgSlug], (previous: unknown) =>
          previous &&
          typeof previous === 'object' &&
          (previous as { actorType?: unknown }).actorType ===
            'organization_user' &&
          (previous as { role?: unknown }).role === 'student'
            ? {
                ...(previous as Record<string, unknown>),
                xp: response.remainingXp,
                level: response.level,
              }
            : previous,
        )
      }
      window.alert(
        `Voucher zakoupen za ${response.xpCost} XP.\nJednorázový promo kód: ${response.code}\nZadejte ho ručně v košíku/checkoutu.\nPo použití už nebude znovu platný.`,
      )
    },
    onError: (error: ApiError) => {
      toast.error(error?.body?.message ?? 'Voucher se nepodařilo zakoupit.')
    },
  })

  const cartSubtotal = resolveCartLines(cart.items, catalog).reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  )

  if (isError) {
    return <StateComp type='error' onAction={refetch} />
  }

  const handleVoucherPurchase = (merchItemId: string) => {
    if (!isOrgAuth || user?.role !== 'student') {
      toast.error('Voucher lze koupit pouze ze studentského účtu.')
      if (orgSlug) {
        const redirect = `/shop?org=${encodeURIComponent(orgSlug)}`
        navigate(
          `${buildOrgLoginPath(orgSlug)}?mode=student&redirect=${encodeURIComponent(redirect)}`,
        )
      }
      return
    }

    purchaseVoucherMutation.mutate({ merchItemId })
  }

  return (
    <div className='w-full max-w-7xl mx-auto space-y-6 md:space-y-8'>
      <section className='rounded-2xl border border-border/70 bg-background/95 p-4 sm:p-6 shadow-sm'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1.5'>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
              Merch Think Different Academy
            </h1>
          </div>

          <Button
            variant='secondary'
            onClick={() => navigate(buildShopPath('/shop/cart', orgSlug))}
            className='w-fit'
          >
            <ShoppingCart size={18} />
            Košík ({itemCount}) {itemCount > 0 ? `• ${formatPrice(cartSubtotal)}` : ''}
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`shop-skeleton-${index}`}
              className='h-85 animate-pulse rounded-2xl border border-border/70 bg-muted/30'
            />
          ))}
        </div>
      ) : catalog.length === 0 ? (
        <StateComp
          type='no-content'
          message='Katalog je zatím prázdný.'
          onAction={refetch}
          actionText='Načíst znovu'
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {catalog.map((item) => (
            <article
              key={item.uuid}
              className='rounded-2xl border border-border/70 bg-background shadow-sm overflow-hidden flex flex-col'
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className='h-52 w-full object-contain bg-muted/20 p-2'
                  loading='lazy'
                />
              ) : (
                <div className='h-52 w-full bg-muted/30' aria-hidden='true' />
              )}

              <div className='p-4 sm:p-5 flex flex-col gap-4 flex-1'>
                <div className='space-y-1.5'>
                  {item.purchaseMode === 'xp' && (
                    <span className='inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary'>
                      XP voucher
                    </span>
                  )}
                  <h2 className='text-lg font-semibold text-foreground'>
                    {item.name}
                  </h2>
                  <p className='text-sm text-muted-foreground min-h-10'>
                    {item.description ?? 'Stylový merch z platformového obchodu.'}
                  </p>
                </div>

                <div className='mt-auto flex items-center justify-between gap-3'>
                  {item.purchaseMode === 'xp' ? (
                    <span className='text-xl font-bold text-primary'>
                      {item.xpCost ?? 0} XP
                    </span>
                  ) : (
                    <span className='text-xl font-bold text-primary'>
                      {formatPrice(item.unitPriceCents)}
                    </span>
                  )}

                  {item.purchaseMode === 'xp' ? (
                    <Button
                      variant='primary'
                      onClick={() => handleVoucherPurchase(item.uuid)}
                      disabled={
                        purchaseVoucherMutation.isPending ||
                        (user?.role === 'student'
                          ? (user.xp ?? 0) < (item.xpCost ?? 0)
                          : false)
                      }
                      className='min-h-11 px-6 text-base sm:text-lg font-semibold'
                    >
                      Koupit za {item.xpCost ?? 0} XP
                    </Button>
                  ) : (
                    <Button
                      variant='primary'
                      onClick={() => addItem(item.uuid)}
                      className='min-h-11 px-7 text-base sm:text-lg font-semibold'
                    >
                      Přidat
                    </Button>
                  )}
                </div>
                {item.purchaseMode === 'xp' &&
                  user?.role === 'student' &&
                  (item.xpCost ?? 0) > (user.xp ?? 0) && (
                    <p className='text-xs text-destructive'>
                      Nemáte dostatek XP ({user.xp ?? 0} / {item.xpCost ?? 0} XP).
                    </p>
                  )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShopCatalogPage
