import { getShopCatalog, purchaseShopVoucher } from '@/api/queries/shopQueries'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import StateComp from '@/components/shared/StateComp'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useShopCart } from '@/hooks/useShopCart'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgLoginPath } from '@/lib/routes'
import type { ApiError } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CheckCircle2, Copy, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
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

type PurchasedVoucher = {
  code: string
  xpCost: number
  alreadyActive?: boolean
}

const ShopCatalogPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orgSlug = resolveShopOrgSlug(searchParams.get('org'))
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation('shop')
  const uiLocale = i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'
  const [purchasedVoucher, setPurchasedVoucher] =
    useState<PurchasedVoucher | null>(null)
  const [isVoucherCodeCopied, setIsVoucherCodeCopied] = useState(false)
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
    queryKey: ['shop-catalog', uiLocale],
    queryFn: getShopCatalog,
  })

  useTitle(t('catalog.pageTitle'))

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

      setPurchasedVoucher({
        code: response.code,
        xpCost: response.xpCost,
      })
    },
    onError: (error: ApiError) => {
      toast.error(error?.body?.message ?? t('catalog.voucherPurchaseFailed'))
    },
  })

  const cartSubtotal = resolveCartLines(cart.items, catalog).reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  )

  if (isError) {
    return <StateComp type='error' onAction={refetch} />
  }

  const handleVoucherPurchase = (
    merchItemId: string,
    voucherXpCost?: number | null,
  ) => {
    if (!isOrgAuth || user?.role !== 'student') {
      toast.error(t('catalog.voucherStudentOnly'))
      if (orgSlug) {
        const redirect = `/shop?org=${encodeURIComponent(orgSlug)}`
        navigate(
          `${buildOrgLoginPath(orgSlug)}?mode=student&redirect=${encodeURIComponent(redirect)}`,
        )
      }
      return
    }

    const activePromoCode = cart.promoCode.trim()
    if (activePromoCode) {
      setPurchasedVoucher({
        code: activePromoCode,
        xpCost: voucherXpCost ?? 0,
        alreadyActive: true,
      })
      return
    }

    purchaseVoucherMutation.mutate({ merchItemId })
  }

  const handleVoucherCodeCopy = async () => {
    const code = purchasedVoucher?.code?.trim()
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setIsVoucherCodeCopied(true)
      window.setTimeout(() => setIsVoucherCodeCopied(false), 2000)
    } catch {
      toast.error(t('catalog.promoCopyFailed'))
    }
  }

  return (
    <>
      <AlertDialog
        open={Boolean(purchasedVoucher)}
        onOpenChange={(open) => {
          if (!open) {
            setPurchasedVoucher(null)
            setIsVoucherCodeCopied(false)
          }
        }}
      >
        <AlertDialogContent className='overflow-hidden rounded-2xl border-border/70 bg-background px-4 pb-4 pt-0 sm:max-w-md sm:px-6 sm:pb-6 sm:pt-0'>
          <div
            className={cn(
              headerLineHeight,
              colorStyles.line.secondary,
              '-mx-4 mb-2 rounded-t-2xl sm:-mx-6 sm:-mt-6 sm:mb-6',
            )}
          />
          <div className='absolute right-3 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/45 text-center text-[#2D8B6B] md:right-5 md:top-5'>
            <CheckCircle2 size={28} />
          </div>
          <AlertDialogHeader className='gap-3'>
            <Label size='lg' className='font-bold'>
              {t('catalog.voucherPurchasedTitle')}
            </Label>
            <AlertDialogDescription asChild>
              <div className='space-y-4 text-sm text-foreground sm:text-base'>
                <p className='leading-relaxed'>
                  {purchasedVoucher?.alreadyActive
                    ? t('catalog.voucherAlreadyActive')
                    : t('catalog.voucherPurchasedForXp', {
                        xp: purchasedVoucher?.xpCost ?? 0,
                      })}
                </p>
                <div className='rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-4'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    {t('catalog.voucherCodeLabel')}
                  </p>
                  <div className='flex flex-row items-center justify-between gap-3'>
                    <code className='block rounded-xl bg-background px-3 py-2 text-sm font-bold text-primary shadow-sm sm:text-base'>
                      {purchasedVoucher?.code ?? ''}
                    </code>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='rounded-xl'
                      onClick={handleVoucherCodeCopy}
                    >
                      {isVoucherCodeCopied ? (
                        <>
                          <Check className='text-secondary' size={16} />
                          {t('catalog.copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          {t('catalog.copy')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <p className='font-semibold'>{t('catalog.voucherInstructions')}</p>
                  <p className='text-sm text-destructive sm:text-base'>
                    {t('catalog.voucherSingleUseWarning')}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  setPurchasedVoucher(null)
                  setIsVoucherCodeCopied(false)
                }}
                variant='primary'
                size='md'
                className='rounded-xl font-bold'
              >
                {t('catalog.continue')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <section className='overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-4 shadow-sm sm:p-6'>
          <div
            className={cn(
              headerLineHeight,
              colorStyles.line['accent-teal'],
              '-mx-4 -mt-4 mb-4 rounded-t-2xl sm:-mx-6 sm:-mt-6 sm:mb-6',
            )}
          />
          <div className='flex flex-row items-center justify-between gap-3'>
            <div className='space-y-1.5'>
              <Label size='xl' className='mb-0 font-bold'>
                {t('catalog.title')}
              </Label>
            </div>

            <Button
              variant='primary'
              size='lg'
              disabled={itemCount === 0}
              onClick={() => navigate(buildShopPath('/shop/cart', orgSlug))}
              className='w-fit rounded-xl'
            >
              <ShoppingCart size={18} />
              <span className='hidden sm:inline-block'>{t('catalog.cartCta')}</span>{' '}
              ({itemCount}){' '}
              <span className='hidden md:inline-block'>
                {itemCount > 0 ? `• ${formatPrice(cartSubtotal)}` : ''}
              </span>
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`shop-skeleton-${index}`}
                className='h-85 animate-pulse rounded-2xl bg-muted/40'
              />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <StateComp
            type='no-content'
            message={t('catalog.emptyCatalog')}
            onAction={refetch}
            actionText={t('catalog.reload')}
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6'>
            {catalog.map((item) => (
              <article
                key={item.uuid}
                className='flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm'
              >
                {item.purchaseMode === 'xp' && (
                  <div className='flex items-center justify-between gap-3 px-4 pt-4'>
                    <span className='inline-flex w-fit rounded-full bg-secondary/45 px-2.5 py-1 text-[11px] font-semibold text-[#2D8B6B]'>
                      {t('catalog.voucherBadge')}
                    </span>
                    {user?.role === 'student' &&
                      (item.xpCost ?? 0) > (user.xp ?? 0) && (
                        <p className='text-right text-xs text-destructive'>
                          {t('catalog.insufficientXp', {
                            current: user.xp ?? 0,
                            required: item.xpCost ?? 0,
                          })}
                        </p>
                      )}
                  </div>
                )}

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={cn(
                      item.purchaseMode === 'xp' ? 'h-38' : 'h-48',
                      'w-full bg-muted/20 p-2 object-contain',
                    )}
                    loading='lazy'
                  />
                ) : (
                  <div className='h-52 w-full bg-muted/30' aria-hidden='true' />
                )}

                <div className='flex flex-1 flex-col gap-2 p-4 sm:p-5'>
                  <div className='space-y-1.5'>
                    <h2 className='text-lg font-semibold text-foreground'>
                      {item.name}
                    </h2>
                    <p className='min-h-8 text-sm text-muted-foreground'>
                      {item.description ?? t('catalog.defaultDescription')}
                    </p>
                  </div>

                  <div className='mt-auto flex items-center justify-between gap-3'>
                    {item.purchaseMode === 'xp' ? (
                      <span className='text-xl font-bold text-accent-teal-light'>
                        {item.xpCost ?? 0} XP
                      </span>
                    ) : (
                      <span className='text-xl font-bold text-accent-teal'>
                        {formatPrice(item.unitPriceCents)}
                      </span>
                    )}

                    {item.purchaseMode === 'xp' ? (
                      <Button
                        variant='grid'
                        onClick={() =>
                          handleVoucherPurchase(item.uuid, item.xpCost)
                        }
                        disabled={
                          purchaseVoucherMutation.isPending ||
                          (user?.role === 'student'
                            ? (user.xp ?? 0) < (item.xpCost ?? 0)
                            : false)
                        }
                        className={cn(
                          'min-h-10 bg-linear-to-br px-6 text-base font-semibold',
                          colorStyles.bg.secondary,
                          colorStyles.text.secondary,
                        )}
                      >
                        {t('catalog.buy')}
                      </Button>
                    ) : (
                      <Button
                        variant='grid'
                        onClick={() => {
                          addItem(item.uuid)
                          toast.success(
                            t('catalog.addedToCart', { name: item.name }),
                          )
                        }}
                        className={cn(
                          'min-h-10 bg-linear-to-br px-7 text-base font-semibold',
                          colorStyles.bg['accent-teal'],
                          colorStyles.text['accent-teal'],
                        )}
                      >
                        {t('catalog.add')}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ShopCatalogPage
