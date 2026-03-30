import { useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useForm, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { useLocation, useNavigate } from 'react-router'
import { useTitle } from '@/lib/dynamicTitleHook'
import { toast } from 'sonner'
import { userLogin } from '@/api/queries/authQueries'
import { useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/lib/types'

const LoginPage = () => {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isAdminLogin = location.pathname.startsWith('/admin')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async (data: FieldValues) => {
    try {
      const result = await userLogin({
        username: data.name,
        password: data.password,
      })

      if (result) {
        queryClient.setQueryData(['auth', 'me'], { username: data.name })
        toast.success('Přihlášení úspěšné')
        navigate('/admin/requests')
        reset()
      }
    } catch (error) {
      const apiError = error as ApiError | undefined
      const message =
        apiError?.body &&
        typeof apiError.body === 'object' &&
        'error' in apiError.body &&
        typeof (apiError.body as { error?: unknown }).error === 'string'
          ? (apiError.body as { error: string }).error
          : 'Přihlášení se nepodařilo'

      toast.error(message)
    }
  }

  useTitle('Přihlášení')

  return (
    <AuthPageShell cardTitle={isAdminLogin ? 'Přihlášení správce platformy' : 'Přihlášení'}>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <FormField
          label='Jméno'
          icon={User}
          inputProps={{
            ...register('name', { required: 'Jméno je povinné' }),
            type: 'text',
            placeholder: isAdminLogin ? 'Přihlašovací jméno správce' : 'Vaše jméno',
          }}
        />
        {errors.name && (
          <p className='error-text'>{errors.name.message as string}</p>
        )}

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

export default LoginPage
