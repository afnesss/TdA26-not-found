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
import { useTranslation } from 'react-i18next'

const MIN_PASSWORD_LENGTH = 8

const OrganizationPasswordPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { me } = useOrganizationAuth(orgSlug)
  const { t } = useTranslation('login')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  useTitle(t('organizationPassword.pageTitle'))

  const onSubmit = async (data: FieldValues) => {
    if (!orgSlug) return

    try {
      const result = await organizationChangePassword(orgSlug, {
        currentPassword: String(data.currentPassword ?? ''),
        newPassword: String(data.newPassword ?? ''),
      })
      queryClient.setQueryData(['org-auth', orgSlug], result)
      toast.success(t('organizationPassword.toasts.passwordChanged'))
      reset()
      navigate(buildOrgDashboardPath(orgSlug))
    } catch {
      toast.error(t('organizationPassword.toasts.passwordChangeError'))
    }
  }

  return (
    <AuthPageShell cardTitle={t('organizationPassword.cardTitle')}>
      <div className='space-y-5'>
        <p className='text-sm text-muted-foreground'>
          {me?.organizationName
            ? t('organizationPassword.descriptionWithOrganization', {
                organizationName: me.organizationName,
              })
            : t('organizationPassword.description')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          <FormField
            label={t('organizationPassword.fields.currentPassword.label')}
            icon={Lock}
            inputProps={{
              ...register('currentPassword', {
                required: t(
                  'organizationPassword.fields.currentPassword.required',
                ),
              }),
              type: showCurrentPassword ? 'text' : 'password',
              placeholder: '........',
            }}
            rightElement={
              <button
                type='button'
                onClick={() => setShowCurrentPassword((value) => !value)}
                className='bg-transparent cursor-pointer'
                aria-pressed={showCurrentPassword}
                aria-label={
                  showCurrentPassword
                    ? t('organizationPassword.actions.hideCurrentPassword')
                    : t('organizationPassword.actions.showCurrentPassword')
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
            label={t('organizationPassword.fields.newPassword.label')}
            icon={Lock}
            inputProps={{
              ...register('newPassword', {
                required: t('organizationPassword.fields.newPassword.required'),
                minLength: {
                  value: MIN_PASSWORD_LENGTH,
                  message: t(
                    'organizationPassword.fields.newPassword.minLength',
                    {
                      count: MIN_PASSWORD_LENGTH,
                    },
                  ),
                },
              }),
              type: showNewPassword ? 'text' : 'password',
              placeholder: '........',
            }}
            rightElement={
              <button
                type='button'
                onClick={() => setShowNewPassword((value) => !value)}
                className='bg-transparent cursor-pointer'
                aria-pressed={showNewPassword}
                aria-label={
                  showNewPassword
                    ? t('organizationPassword.actions.hideNewPassword')
                    : t('organizationPassword.actions.showNewPassword')
                }
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
            {t('organizationPassword.actions.submit')}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  )
}

export default OrganizationPasswordPage
