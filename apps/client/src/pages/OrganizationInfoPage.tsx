import { getOrganizationPublicInfo } from '@/api/queries/organizationQueries'
import Breadcrumb from '@/components/shared/Breadcrumb'
import HintPageText from '@/components/shared/HintPageText'
import StateComp from '@/components/shared/StateComp'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { colorStyles, headerLineHeight } from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgBasePath, buildOrgCoursesPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Building2, Mail, MapPin } from 'lucide-react'
import { useParams } from 'react-router-dom'

const OrganizationInfoPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['organization-public-info', orgSlug],
    queryFn: () => getOrganizationPublicInfo(orgSlug!),
    enabled: Boolean(orgSlug),
  })

  useTitle(data?.name ? `Info | ${data.name}` : 'Info organizace')

  if (isLoading) {
    return <StateComp type='no-content' message='Načítám organizaci…' />
  }

  if (isError || !data) {
    return <StateComp type='not-found' onAction={() => void refetch()} />
  }

  return (
    <div className='max-w-6xl mx-auto space-y-5 md:space-y-6'>
      <HintPageText text='Informace o organizaci' icon={Building2} />

      <Card className='border border-border/60 shadow-md bg-background rounded-xl cursor-auto'>
        <div className={cn(headerLineHeight, colorStyles.line.secondary)} />
        <CardContent className='p-4 lg:p-6 -mt-2 space-y-2'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 space-y-2'>
              <Breadcrumb
                items={[
                  { label: data.name, path: buildOrgBasePath(orgSlug) },
                  { label: 'Info' },
                ]}
              />
              <div className='space-y-1'>
                <Label className='mb-0 font-bold' size='lg'>
                  {data.name}
                </Label>
                <p className='text-sm md:text-base text-gray-600 leading-relaxed'>
                  Veřejné informace o organizaci, kontaktní údaje a základní
                  přehled jejího působení.
                </p>
              </div>
            </div>

            <div className='hidden sm:flex shrink-0 items-center rounded-full bg-secondary/30 px-3 py-1.5 text-sm font-semibold text-[#2D8B6B]'>
              /{data.slug}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-5'>
        <Card className='border border-border/60 shadow-md bg-background rounded-xl cursor-auto'>
          <CardContent className='p-4 lg:p-5 space-y-4'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                Základní přehled
              </p>
              <Label className='mb-0 font-bold' size='default'>
                Organizace
              </Label>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1 rounded-xl border border-gray-100 bg-muted/25 p-3.5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  Název
                </p>
                <p className='text-base md:text-lg font-semibold text-foreground'>
                  {data.name}
                </p>
              </div>

              <div className='space-y-1 rounded-xl border border-gray-100 bg-muted/25 p-3.5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  Typ
                </p>
                <p className='text-foreground'>{data.type}</p>
              </div>

              <div className='space-y-1 rounded-xl border border-gray-100 bg-muted/25 p-3.5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  Kontaktní osoba
                </p>
                <p className='text-foreground'>{data.ownerName}</p>
              </div>

              <div className='rounded-xl border border-gray-100 bg-muted/25 p-3.5 sm:col-span-2'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <MapPin className='size-4' />
                  </div>
                  <div className='min-w-0 space-y-1'>
                    <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                      Adresa
                    </p>
                    <div className='space-y-0.5 text-sm md:text-base text-foreground leading-snug'>
                      <p>{data.address}</p>
                      <p>
                        {data.postalCode} {data.city}
                      </p>
                      <p className='text-gray-600'>
                        {data.region}, {data.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-border/60 shadow-md bg-background rounded-xl cursor-auto'>
          <CardContent className='p-4 lg:p-5 space-y-4'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                Kontakt
              </p>
              <Label className='mb-0 font-bold' size='default'>
                Spojení s organizací
              </Label>
            </div>

            <div className='space-y-4'>
              <div className='rounded-xl border border-gray-100 bg-muted/25 p-3.5'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Mail className='size-4' />
                  </div>
                  <div className='min-w-0 space-y-1'>
                    <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                      Kontaktní e-mail
                    </p>
                    <a
                      href={`mailto:${data.contactEmail}`}
                      className='inline-block break-all text-sm md:text-base font-semibold text-primary underline-offset-4 hover:underline'
                    >
                      {data.contactEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div className='space-y-2 rounded-xl border border-gray-100 bg-background p-3.5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  Co zde najdete
                </p>
                <p className='text-sm md:text-base text-gray-600 leading-relaxed'>
                  Přehled kurzů organizace, veřejné informace a vstupní body pro
                  studenty i lektory v rámci této organizační stránky.
                </p>
              </div>

              <div className='rounded-xl border border-gray-100 bg-background p-3.5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  URL organizace
                </p>
                <p className='mt-1.5 text-sm md:text-base font-semibold text-foreground'>
                  /{data.slug}
                </p>
                <p className='mt-1.5 text-sm text-muted-foreground'>
                  Kurzy této organizace jsou dostupné pouze přes její vlastní
                  prostor.
                </p>
                <a
                  href={buildOrgCoursesPath(orgSlug)}
                  className='mt-2.5 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline'
                >
                  Otevřít kurzy organizace
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrganizationInfoPage
