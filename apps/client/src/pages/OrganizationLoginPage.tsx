import { organizationLogin } from '@/api/queries/organizationQueries'
import { setOrgToken } from '@/auth/storage'
import AuthPageShell from '@/components/auth/AuthPageShell'
import FormField from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursesPath, buildOrgDashboardPath } from '@/lib/routes'
import type { ApiError } from '@/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

type LoginMode = 'lecturer' | 'student'

const OrganizationLoginPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [show, setShow] = useState(false)
  const { t } = useTranslation('login')
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
  useTitle(t('organization.pageTitle'))

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
      setOrgToken(orgSlug, result.token)
      const { token: _token, ...authMe } = result
      queryClient.setQueryData(['org-auth', orgSlug], authMe)
      toast.success(t('organization.success'))
      const defaultRedirect =
        authMe.actorType === 'organization_admin'
          ? '/admin/requests'
          : authMe.actorType === 'organization_user' &&
              authMe.role === 'lecturer'
            ? buildOrgDashboardPath(orgSlug)
            : buildOrgCoursesPath(orgSlug)
      navigate(safeRedirect || defaultRedirect)
      reset()
    } catch (error) {
      const _apiError = error as ApiError | undefined
      toast.error(t('organization.failure'))
    }
  }

  return (
    <AuthPageShell cardTitle={t('organization.cardTitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <div className='grid grid-cols-2 gap-2'>
          <Button
            type='button'
            variant={mode === 'lecturer' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setMode('lecturer')}
          >
            {t('organization.roles.lecturer')}
          </Button>
          <Button
            type='button'
            variant={mode === 'student' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setMode('student')}
          >
            {t('organization.roles.student')}
          </Button>
        </div>

        {mode === 'student' && (
          <p className='text-xs text-muted-foreground'>
            {t('organization.hints.studentLogin')}
          </p>
        )}

        <FormField
          label={t('organization.fields.username.label')}
          icon={User}
          inputProps={{
            ...register('username', {
              required: t('organization.fields.username.required'),
            }),
            type: 'text',
            placeholder:
              mode === 'lecturer'
                ? t('organization.fields.username.lecturerPlaceholder')
                : t('organization.fields.username.studentPlaceholder'),
          }}
        />

        {errors.username && (
          <p className='error-text'>{errors.username.message as string}</p>
        )}

        <FormField
          label={t('organization.fields.password.label')}
          icon={Lock}
          inputProps={{
            ...register('password', {
              required: t('organization.fields.password.required'),
            }),
            type: show ? 'text' : 'password',
            placeholder: t('organization.fields.password.placeholder'),
          }}
          rightElement={
            <button
              type='button'
              onClick={() => setShow((s) => !s)}
              className='bg-transparent cursor-pointer'
              aria-pressed={show}
              aria-label={
                show
                  ? t('organization.actions.hidePassword')
                  : t('organization.actions.showPassword')
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
          {t('organization.actions.submit')}
        </Button>
      </form>
    </AuthPageShell>
  )
}

export default OrganizationLoginPage
