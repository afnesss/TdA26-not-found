import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useForm, type FieldValues } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationChangePassword } from '@/api/queries/organizationQueries'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgDashboardPath } from '@/lib/routes'

const MIN_PASSWORD_LENGTH = 8

const OrganizationPasswordPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { me } = useOrganizationAuth(orgSlug)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  useTitle('Změna hesla organizace')

  const onSubmit = async (data: FieldValues) => {
    if (!orgSlug) return

    try {
      const result = await organizationChangePassword(orgSlug, {
        currentPassword: String(data.currentPassword ?? ''),
        newPassword: String(data.newPassword ?? ''),
      })
      queryClient.setQueryData(['org-auth', orgSlug], result)
      toast.success('Heslo bylo změněno')
      reset()
      navigate(buildOrgDashboardPath(orgSlug))
    } catch {
      toast.error('Nepodařilo se změnit heslo')
    }
  }

  return (
    <AuthPageShell cardTitle='Nastavení hesla organizace'>
      <div className='space-y-5'>
        <p className='text-sm text-muted-foreground'>
          {me?.organizationName
            ? `Organizace ${me.organizationName} se právě aktivuje. Nejprve změňte dočasné heslo a poté budete pokračovat do dashboardu.`
            : 'Nejprve změňte dočasné heslo organizace. Poté budete pokračovat do dashboardu.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          <FormField
            label='Současné heslo'
            icon={Lock}
            inputProps={{
              ...register('currentPassword', {
                required: 'Současné heslo je povinné',
              }),
              type: showCurrentPassword ? 'text' : 'password',
              placeholder: '••••••••',
            }}
            rightElement={
              <button
                type='button'
                onClick={() => setShowCurrentPassword((value) => !value)}
                className='bg-transparent cursor-pointer'
                aria-pressed={showCurrentPassword}
                aria-label={
                  showCurrentPassword ? 'Skrýt současné heslo' : 'Zobrazit současné heslo'
                }
              >
                {showCurrentPassword ? (
                  <Eye className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
                ) : (
                  <EyeOff className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
                )}
              </button>
            }
          />
          {errors.currentPassword && (
            <p className='error-text'>{errors.currentPassword.message as string}</p>
          )}

          <FormField
            label='Nové heslo'
            icon={Lock}
            inputProps={{
              ...register('newPassword', {
                required: 'Nové heslo je povinné',
                minLength: {
                  value: MIN_PASSWORD_LENGTH,
                  message: `Nové heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků`,
                },
              }),
              type: showNewPassword ? 'text' : 'password',
              placeholder: '••••••••',
            }}
            rightElement={
              <button
                type='button'
                onClick={() => setShowNewPassword((value) => !value)}
                className='bg-transparent cursor-pointer'
                aria-pressed={showNewPassword}
                aria-label={showNewPassword ? 'Skrýt nové heslo' : 'Zobrazit nové heslo'}
              >
                {showNewPassword ? (
                  <Eye className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
                ) : (
                  <EyeOff className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
                )}
              </button>
            }
          />
          {errors.newPassword && (
            <p className='error-text'>{errors.newPassword.message as string}</p>
          )}

          <Button
            disabled={isSubmitting}
            type='submit'
            variant='primary'
            size='primary'
            className='mt-3'
          >
            Uložit nové heslo
          </Button>
        </form>
      </div>
    </AuthPageShell>
  )
}

export default OrganizationPasswordPage
