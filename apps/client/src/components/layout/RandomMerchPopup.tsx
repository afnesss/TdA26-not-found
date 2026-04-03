import { getShopCatalog } from '@/api/queries/shopQueries'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import type { ShopCatalogItem } from '@/lib/schemas'
import { getOrgSlugFromPathname } from '@/lib/routes'
import { cn } from '@/lib/utils'
import {
  buildShopPath,
  formatPrice,
  resolveShopOrgSlug,
} from '@/pages/shop/shopUtils'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import thinkBlueIcon from '@/assets/t-think-blue1.svg'
import { Label } from '../ui/label'
import UnderlinedText from '../shared/UnderlinedText'

const POPUP_STORAGE_KEY = 'platform-random-merch-popup-seen-v1'

const getPopupSeen = () => {
  if (typeof window === 'undefined') return true

  return window.sessionStorage.getItem(POPUP_STORAGE_KEY) === 'true'
}

const markPopupSeen = () => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(POPUP_STORAGE_KEY, 'true')
}

const pickRandomItem = (items: ShopCatalogItem[]) => {
  if (items.length === 0) return null

  return items[Math.floor(Math.random() * items.length)] ?? null
}

const RandomMerchPopup = () => {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShopCatalogItem | null>(null)

  const currentOrgSlug = getOrgSlugFromPathname(pathname)
  const shopOrgSlug = resolveShopOrgSlug(
    currentOrgSlug ?? new URLSearchParams(search).get('org'),
  )
  const shouldSkipPopup =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/organization-request')

  const { data: catalog = [] } = useQuery({
    queryKey: ['shop-catalog'],
    queryFn: getShopCatalog,
    enabled: !shouldSkipPopup,
  })

  const merchItems = catalog.filter(
    (item) =>
      item.purchaseMode === 'money' && item.voucherDiscountPercent == null,
  )

  useEffect(() => {
    if (shouldSkipPopup || getPopupSeen() || merchItems.length === 0) return

    const timeoutId = window.setTimeout(() => {
      setSelectedItem(
        (currentItem) => currentItem ?? pickRandomItem(merchItems),
      )
      setIsOpen(true)
      markPopupSeen()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [merchItems, shouldSkipPopup])

  if (!selectedItem) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className='w-full max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none sm:max-w-lg md:p-0'>
        <div className='relative overflow-hidden rounded-2xl  bg-background px-2 pb-2 sm:px-4 sm:pb-4 pt-0 shadow-lg  sm:pt-0'>
          <img
            src={thinkBlueIcon}
            alt=''
            aria-hidden='true'
            className='max-sm:hidden absolute right-5 top-6 h-8 w-8  sm:h-9 sm:w-9'
          />
          <div
            className={cn(
              headerLineHeight,
              colorStyles.line['accent-teal'],
              '-mx-4 rounded-t-2xl sm:-mx-6 mb-2 ',
            )}
          />

          <div className='min-w-0 p-4 '>
            <AlertDialogHeader className='gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary/75'>
                Think Different Academy merch
              </p>
              <Label size={'xl'} className='mb-0'>
                Chceš myslet jinak?
              </Label>
              <AlertDialogDescription asChild>
                <div className='space-y-4 text-sm text-foreground sm:text-base'>
                  <p className='leading-relaxed text-muted-foreground'>
                    Podpoř nás koupí merche Think Different Academy.
                  </p>
                  <div className='flex items-center gap-3 rounded-2xl bg-secondary/15 p-3 sm:gap-5 sm:p-4'>
                    <div className='relative w-full max-w-20 shrink-0 overflow-hidden rounded-2xl bg-background shadow-sm sm:max-w-24 md:max-w-28'>
                      {selectedItem.imageUrl ? (
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.name}
                          className=' h-full w-full object-cover'
                        />
                      ) : (
                        <div className='flex aspect-square items-center justify-center bg-muted/30 text-muted-foreground'>
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className='min-w-0'>
                      <UnderlinedText
                        offset='-bottom-0.5'
                        className='block text-lg font-semibold text-foreground'
                      >
                        {selectedItem.name}
                      </UnderlinedText>
                      {selectedItem.description ? (
                        <p className='mt-2 break-words leading-relaxed text-muted-foreground'>
                          {selectedItem.description}
                        </p>
                      ) : null}
                      <p className='mt-4 text-base font-bold text-primary'>
                        {formatPrice(selectedItem.unitPriceCents)}
                      </p>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className='mt-5 flex-wrap justify-start'>
              <AlertDialogAction asChild>
                <Button
                  variant='primary'
                  size='lg'
                  className='rounded-xl font-bold'
                  onClick={() => {
                    navigate(buildShopPath('/shop', shopOrgSlug))
                    setIsOpen(false)
                  }}
                >
                  Prohlédnout merch
                </Button>
              </AlertDialogAction>
              <AlertDialogCancel asChild>
                <Button
                  variant='outline'
                  size='lg'
                  className='rounded-xl text-sm'
                  onClick={() => setIsOpen(false)}
                >
                  Zavřít
                </Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RandomMerchPopup
