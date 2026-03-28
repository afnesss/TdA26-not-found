import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText'
import LogoAnim from '@/components/shared/LogoAnim'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import TitleText from '@/components/shared/TitleText'
import FormField from '@/components/shared/FormField'
import { Label } from '@/components/ui/label'
import { useLocation, useNavigate } from 'react-router'
import { useTitle } from '@/lib/dynamicTitleHook'
import { toast } from 'sonner'
import { studentUpsertLogin, userLogin } from '@/api/queries/authQueries'
import { useQueryClient } from '@tanstack/react-query'

type LoginFormValues = {
  name: string
  password: string
}

type LoginMode = 'lecturer' | 'student'

const LoginPage = () => {
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<LoginMode>('lecturer')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const redirectTarget = useMemo(() => {
    const redirectParam = searchParams.get('redirect')
    if (!redirectParam?.startsWith('/')) return ''
    return redirectParam
  }, [searchParams])
  const requestedMode = searchParams.get('mode') === 'student' ? 'student' : 'lecturer'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<LoginFormValues>()

  useEffect(() => {
    setMode(requestedMode)
    clearErrors()
  }, [clearErrors, requestedMode])

  const onSubmit = async (data: LoginFormValues) => {
    clearErrors('root')
    const username = data.name.trim()

    try {
      if (mode === 'lecturer') {
        const result = await userLogin({
          username,
          password: data.password,
        })
        queryClient.setQueryData(['auth', 'me'], result.user)
        toast.success('Přihlášení lektora úspěšné')
        navigate('/dashboard', { replace: true })
      } else {
        const result = await studentUpsertLogin({
          username,
          password: data.password,
        })
        queryClient.setQueryData(['auth', 'me'], result.user)
        toast.success('Přihlášení studenta úspěšné')
        navigate(redirectTarget || '/courses', { replace: true })
      }

      reset({ name: '', password: '' })
    } catch (error: unknown) {
      const apiError = error as
        | {
            status?: number
            body?: { message?: string; error?: string }
          }
        | undefined

      const fallbackMessage =
        mode === 'lecturer'
          ? 'Nepodařilo se přihlásit jako lektor'
          : 'Nepodařilo se přihlásit do kurzu'

      let message =
        apiError?.body?.message || apiError?.body?.error || fallbackMessage

      if (mode === 'lecturer' && apiError?.status === 401) {
        message = 'Nesprávné přihlašovací údaje'
      }
      if (mode === 'student' && apiError?.status === 401) {
        message = 'Nesprávné heslo'
      }
      if (mode === 'student' && apiError?.status === 409) {
        message = 'Uživatelské jméno je již obsazené'
      }

      setError('root', { type: 'server', message })
    }
  }

  useTitle('Přihlášení')

  return (
    <div className='w-full max-w-6xl mx-auto grid h-full md:grid-cols-2 lg:grid-cols-2'>
      <div className='relative justify-center h-full hidden md:flex items-center px-4 md:pl-6 lg:pl-10 lg:pr-20'>
        <div className='space-y-8 text-left'>
          <HintPageText icon={Sparkles} text='Začněte svou cestu' />
          <TitleText
            underlinedText='Vítejte zpět v'
            highlightedText='Think Different Academy'
          />

          <div className='relative flex items-center justify-center pt-8'>
            <LogoAnim sizeBlur1='w-40 h-40' sizeBlur2='w-48 h-48' />
          </div>
        </div>
      </div>

      <div className='flex justify-center items-center w-full md:px-6 lg:px-10'>
        <div className='w-full max-w-md'>
          <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
            <Label variant={'formTitle'}>
              Přihlášení
            </Label>

            <div className='px-5 sm:px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-3'
              >
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    type='button'
                    variant={mode === 'lecturer' ? 'primary' : 'outline'}
                    size='sm'
                    onClick={() => {
                      setMode('lecturer')
                      clearErrors()
                    }}
                  >
                    Lektor
                  </Button>
                  <Button
                    type='button'
                    variant={mode === 'student' ? 'primary' : 'outline'}
                    size='sm'
                    onClick={() => {
                      setMode('student')
                      clearErrors()
                    }}
                  >
                    Student
                  </Button>
                </div>

                <FormField
                  label='Jméno'
                  icon={User}
                  inputProps={{
                    ...register('name', { required: 'Jméno je povinné' }),
                    type: 'text',
                    placeholder: 'Vaše jméno',
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
                  <p className='error-text'>
                    {errors.password.message as string}
                  </p>
                )}

                {errors.root && (
                  <p className='text-sm text-destructive'>
                    {errors.root.message as string}
                  </p>
                )}

                <Button
                  disabled={isSubmitting}
                  type='submit'
                  variant='primary'
                  size='primary'
                  className='mt-3'
                >
                  {mode === 'lecturer'
                    ? 'Přihlásit se jako lektor'
                    : 'Přihlásit se do kurzu'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
