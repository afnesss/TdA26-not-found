import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { organizationLogin } from '@/api/queries/organizationQueries'
import { Button } from '@/components/ui/button'
import { buildOrgDashboardPath, buildOrgPasswordPath } from '@/lib/routes'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, type FieldValues } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const OrganizationLoginPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [show, setShow] = useState(false)
  useTitle('Přihlášení organizace')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async (data: FieldValues) => {
    if (!orgSlug) return

    try {
      const result = await organizationLogin(orgSlug, {
        password: String(data.password ?? ''),
      })
      queryClient.setQueryData(['org-auth', orgSlug], result)
      toast.success('Přihlášení úspěšné')
      navigate(
        result.mustChangePassword
          ? buildOrgPasswordPath(orgSlug)
          : buildOrgDashboardPath(orgSlug),
      )
      reset()
    } catch (error) {
      toast.error('Nepodařilo se přihlásit')
    }
  }

  return (
    <AuthPageShell cardTitle='Přihlášení'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <FormField
          label='Heslo'
          icon={Lock}
          inputProps={{
            ...register('password', { required: 'Heslo je povinné' }),
            type: show ? 'text' : 'password',
            placeholder: '••••••••',
          }}
          rightElement={
            <button
              type='button'
              onClick={() => setShow((s) => !s)}
              className='bg-transparent cursor-pointer'
              aria-pressed={show}
              aria-label={show ? 'Skrýt heslo' : 'Zobrazit heslo'}
            >
              {show ? (
                <Eye className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
              ) : (
                <EyeOff className='w-4 sm:w-5 h-4 sm:h-5 text-gray-800/50' />
              )}
            </button>
          }
        />

        {errors.password && (
          <p className='error-text'>{errors.password.message as string}</p>
        )}

        <Button
          disabled={isSubmitting}
          type='submit'
          variant='primary'
          size='primary'
          className='mt-3'
        >
          Přihlásit se
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default OrganizationLoginPage
