import { userLogin } from '@/api/queries/authQueries'
import { setAdminToken } from '@/auth/storage'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ApiError } from '@/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

const LoginPage = () => {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isAdminLogin = location.pathname.startsWith('/admin')
  const { t } = useTranslation('login')

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
        setAdminToken(result.token)
        queryClient.setQueryData(['auth', 'me'], {
          actorType: result.actorType,
          username: result.username,
        })
        toast.success(t('admin.success'))
        navigate('/admin/requests')
        reset()
      }
    } catch (error) {
      const _apiError = error as ApiError | undefined
      toast.error(t('admin.failure'))
    }
  }

  useTitle(t('admin.pageTitle'))

  return (
    <AuthPageShell
      cardTitle={isAdminLogin ? t('admin.cardTitle') : t('admin.pageTitle')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <FormField
          label={t('admin.fields.name.label')}
          icon={User}
          inputProps={{
            ...register('name', {
              required: t('admin.fields.name.required'),
            }),
            type: 'text',
            placeholder: t('admin.fields.name.placeholder'),
          }}
        />
        {errors.name && (
          <p className='error-text'>{errors.name.message as string}</p>
        )}

        <FormField
          label={t('admin.fields.password.label')}
          icon={Lock}
          inputProps={{
            ...register('password', {
              required: t('admin.fields.password.required'),
            }),
            type: show ? 'text' : 'password',
            placeholder: t('admin.fields.password.placeholder'),
          }}
          rightElement={
            <button
              type='button'
              onClick={() => setShow((s) => !s)}
              className='bg-transparent cursor-pointer'
              aria-pressed={show}
              aria-label={
                show
                  ? t('admin.actions.hidePassword')
                  : t('admin.actions.showPassword')
              }
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
          {t('admin.actions.submit')}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default LoginPage
