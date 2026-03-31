import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { organizationLogin } from '@/api/queries/organizationQueries'
import { Button } from '@/components/ui/button'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursesPath, buildOrgDashboardPath } from '@/lib/routes'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, type FieldValues } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/types'

type LoginMode = 'lecturer' | 'student'

const OrganizationLoginPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [show, setShow] = useState(false)
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const requestedMode = queryParams.get('mode')
  const initialMode: LoginMode =
    requestedMode === 'lecturer' || requestedMode === 'student'
      ? requestedMode
      : 'student'
  const [mode, setMode] = useState<LoginMode>(initialMode)
  const redirectParam = queryParams.get('redirect') ?? ''
  const safeRedirect = redirectParam.startsWith('/') ? redirectParam : ''
  useTitle('Přihlášení organizace')

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

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
        mode,
        username: String(data.username ?? '').trim(),
        password: String(data.password ?? ''),
      })
      queryClient.setQueryData(['org-auth', orgSlug], result)
      toast.success('Přihlášení úspěšné')
      const defaultRedirect =
        result.actorType === 'organization_admin'
          ? '/admin/requests'
          : result.actorType === 'organization_user' &&
              result.role === 'lecturer'
            ? buildOrgDashboardPath(orgSlug)
            : buildOrgCoursesPath(orgSlug)
      navigate(safeRedirect || defaultRedirect)
      reset()
    } catch (error) {
      const apiError = error as ApiError | undefined
      const message =
        apiError?.body &&
        typeof apiError.body === 'object' &&
        'message' in apiError.body &&
        typeof (apiError.body as { message?: unknown }).message === 'string'
          ? (apiError.body as { message: string }).message
          : 'Nepodařilo se přihlásit'

      toast.error(message)
    }
  }

  return (
    <AuthPageShell cardTitle='Přihlášení'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <div className='grid grid-cols-2 gap-2'>
          <Button
            type='button'
            variant={mode === 'lecturer' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setMode('lecturer')}
          >
            Lektor
          </Button>
          <Button
            type='button'
            variant={mode === 'student' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setMode('student')}
          >
            Student
          </Button>
        </div>

        <FormField
          label='Uživatelské jméno'
          icon={User}
          inputProps={{
            ...register('username', { required: 'Jméno je povinné' }),
            type: 'text',
            placeholder: mode === 'lecturer' ? 'Lektor' : 'Student',
          }}
        />

        {errors.username && (
          <p className='error-text'>{errors.username.message as string}</p>
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

export default OrganizationLoginPage
