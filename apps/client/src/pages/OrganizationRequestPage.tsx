import { submitOrganizationRequest } from '@/api/queries/organizationQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const initialState = {
  name: '',
  country: '',
  city: '',
  address: '',
  postalCode: '',
  region: '',
  type: '',
  ownerName: '',
  contactEmail: '',
}

type StoredRequestTracking = {
  requestId: string
  trackingUrl: string
} | null

const OrganizationRequestPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [lastRequestTracking, setLastRequestTracking] =
    useLocalStorage<StoredRequestTracking>(
      'organization-request-tracking',
      null,
    )

  useTitle('Založit organizaci')

  const mutation = useMutation({
    mutationFn: submitOrganizationRequest,
    onSuccess: (data) => {
      const tracking = {
        requestId: data.requestId,
        trackingUrl: data.trackingUrl,
      }
      setLastRequestTracking(tracking)
      toast.success('Žádost byla přijata')
      navigate(data.trackingUrl)
    },
  })

  const canSubmit = useMemo(
    () => Object.values(form).every((value) => value.trim().length > 0),
    [form],
  )

  return (
    <div className='mx-auto w-full max-w-5xl'>
      <div className='overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 shadow-xl backdrop-blur-lg md:shadow-lg'>
        <Label variant='formTitle'>Založit si organizaci</Label>
        <div className='bg-background px-5 py-4 sm:px-6 lg:px-8 md:py-8'>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              mutation.mutate(form)
            }}
            className='flex flex-col gap-4'
          >
            <p className='text-sm leading-6 text-muted-foreground'>
              Pošlete základní údaje o vaší organizaci. Název veřejné adresy
              připravíme automaticky podle názvu organizace.
            </p>

            {lastRequestTracking ? (
              <div className='flex flex-col gap-3 rounded-2xl  bg-primary/10 p-4 md:flex-row md:items-center md:justify-between'>
                <p className='text-sm leading-6 text-foreground'>
                  Už jste dříve odeslali žádost a můžete se vrátit k jejímu
                  stavu.
                </p>
                <Link to={lastRequestTracking.trackingUrl}>
                  <Button variant='outline' size='sm' className='rounded-xl'>
                    Zobrazit poslední žádost
                  </Button>
                </Link>
              </div>
            ) : null}

            <div className='grid gap-4 md:grid-cols-2'>
              <Input
                placeholder='Název organizace'
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <Input
                placeholder='Země'
                value={form.country}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, country: event.target.value }))
                }
              />
              <Input
                placeholder='Město'
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
              <Input
                placeholder='PSČ'
                value={form.postalCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    postalCode: event.target.value,
                  }))
                }
              />
              <Input
                placeholder='Region'
                value={form.region}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, region: event.target.value }))
                }
              />
              <Input
                placeholder='Typ pobočky'
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value }))
                }
              />
              <Input
                placeholder='Vedoucí / kontaktní osoba'
                value={form.ownerName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ownerName: event.target.value,
                  }))
                }
              />
              <Input
                placeholder='Kontaktní e-mail'
                type='email'
                value={form.contactEmail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contactEmail: event.target.value,
                  }))
                }
              />
              <Textarea
                className='min-h-28 md:col-span-2'
                minRows={3}
                placeholder='Adresa'
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </div>

            <div className='flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between'>
              <p className='text-sm text-muted-foreground'>
                Odesláním žádosti zahájíte schvalovací proces nové organizace.
              </p>
              <Button
                type='submit'
                variant='primary'
                size='primary'
                disabled={!canSubmit || mutation.isPending}
                className='w-full md:w-auto'
              >
                {mutation.isPending ? 'Odesílám…' : 'Odeslat žádost'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrganizationRequestPage
