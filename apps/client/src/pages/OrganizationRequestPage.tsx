import { submitOrganizationRequest } from '@/api/queries/organizationQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

const OrganizationRequestPage = () => {
  const [form, setForm] = useState(initialState)
  const [submitted, setSubmitted] = useState<{
    requestId: string
    trackingUrl: string
  } | null>(null)
  useTitle('Založit organizaci')

  const mutation = useMutation({
    mutationFn: submitOrganizationRequest,
    onSuccess: (data) => {
      setSubmitted({ requestId: data.requestId, trackingUrl: data.trackingUrl })
    },
  })

  const canSubmit = useMemo(
    () => Object.values(form).every((value) => value.trim().length > 0),
    [form],
  )

  if (submitted) {
    return (
      <div className='mx-auto w-full max-w-3xl'>
        <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
          <Label variant='formTitle'>Žádost byla přijata</Label>
          <div className='px-5 sm:px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
            <div className='space-y-6'>
              <p className='text-lg leading-8 text-foreground sm:text-xl'>
                Vše je v pořádku. Po schválení vám budou přístupové údaje
                zaslány ručně na kontaktní e-mail.
              </p>
              <Link to={submitted.trackingUrl} className='block'>
                <Button
                  variant='primary'
                  size='primary'
                  className='w-full text-base sm:text-lg'
                >
                  Zobrazit stav žádosti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-5xl'>
      <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
        <Label variant='formTitle'>Založit si organizaci</Label>
        <div className='px-5 sm:px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
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
                  setForm((prev) => ({ ...prev, postalCode: event.target.value }))
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
                  setForm((prev) => ({ ...prev, ownerName: event.target.value }))
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
