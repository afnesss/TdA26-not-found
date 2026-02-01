import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText'
import { Input } from '@/components/ui/input'
import LogoAnim from '@/components/shared/LogoAnim'
import { useForm, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import TitleText from '@/components/shared/TitleText'
import FormField from '@/components/shared/FormField'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router'
import auth from '@/auth/fakeAuth'

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm()

  const onSubmit = async (data: FieldValues) => {
    const isSuccess = auth.login(data.name, data.password, setError)
    if (isSuccess) {
      navigate('/dashboard')
      reset()
    }
  }

  return (
    <div className='max-w-6xl mx-auto grid h-full md:grid-cols-2 lg:grid-cols-2'>
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

      <div className='px-2 md:px-6 lg:px-10 flex justify-center items-center'>
        <div className='w-full max-w-md'>
          <div className='bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10'>
            <Label variant={'formTitle'}>
              {/* <span className="relative z-10">{!isLogin ? "Vytvořit účet" : "Přihlášení"}</span> */}
              Přihlášení
            </Label>

            {/* Form content */}
            <div className='px-6 lg:px-8 py-6 md:py-8 bg-background/95'>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-3'
              >
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

                {/* {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-foreground/70 cursor-pointer hover:text-foreground transition-colors">
                      <input 
                        type="checkbox" 
                        className="mr-2 rounded accent-primary cursor-pointer"
                      />
                      Zapamatovat
                    </label>
                    <button className="text-primary hover:text-accent-blue font-semibold transition-colors">
                      Zapomenuté heslo?
                    </button>
                  </div>
                )} */}

                <Button
                  disabled={isSubmitting}
                  type='submit'
                  variant='primary'
                  size='primary'
                  className='mt-3'
                >
                  {isLogin ? 'Přihlásit se' : 'Zaregistrovat se'}
                </Button>

                {/* For future registration */}
                {/* <p className="text-sm text-gray-600 text-center mt-2">
                  {isLogin ? "Nemáte účet? " : "Již máte účet? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-accent-teal-light hover:text-accent-teal font-semibold transition-colors duration-200 underline-offset-2 hover:underline"
                  >
                    {isLogin ? "Zaregistrujte se" : "Přihlaste se"}
                  </button>
                </p> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
