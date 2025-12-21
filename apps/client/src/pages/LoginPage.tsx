import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react'
import HintPageText from '@/components/shared/HintPageText';
import { Input } from '@/components/ui/input';
import LogoAnim from '@/components/shared/LogoAnim';
import {useForm, type FieldValues} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import TitleText from '@/components/shared/TitleText';
import FormField from '@/components/shared/FormField';


const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    reset,
    setError
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    console.log('Form submitted');

    if (data.name!== '' && data.name !== 'Lecturer' || data.password !== 'TdA26!' && data.password !== '') {
      setError('root', {
      type: 'manual',
      message: 'Nesprávné přihlašovací údaje'
    });
    return;
  }
    await new Promise ((resolve) => setTimeout(resolve,1000))
    reset();
  }

  return (
    <div className="max-w-6xl mx-auto overflow-hidden grid h-full md:grid-cols-2 lg:grid-cols-2">
      {/* Left side - Welcome content */}
      <div className='relative justify-center h-full hidden md:flex items-center px-4 md:pl-6 lg:pl-10 lg:pr-20'>
        <div className="space-y-8 text-left">

          <HintPageText icon={Sparkles} text='Začněte svou cestu'/>
          <TitleText underlinedText='Vítejte zpět v' highlightedText='Think Different Academy'/>

          {/* Animated logo section */}
          <div className="relative flex items-center justify-center pt-8">
            <LogoAnim sizeBlur1='w-40 h-40' sizeBlur2='w-48 h-48'/>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="px-2 md:px-6 lg:px-10 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10">
            {/* Header with linear */}
            <div className="relative bg-linear-to-r from-primary to-accent-blue text-xl font-semibold text-background flex items-center justify-center py-5">
              {/* <span className="relative z-10">{!isLogin ? "Vytvořit účet" : "Přihlášení"}</span> */}
              Přihlášení
            </div>

            {/* Form content */}
            <div className="px-6 lg:px-8 py-8 bg-background/95">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

                  <FormField label='Jméno' icon={User} children={(
                      <Input
                        {...register('name', 
                          {required: 'Jméno je povinné'
                          }
                        )}
                        type="text"
                        placeholder="Jan Novák"
                        className=" pl-11 pr-4"
                      />
                  )}/>
                  {errors.name && 
                  <p className='text-destructive'>{errors.name.message as string}</p>}
                
                <FormField label='Heslo' icon={Lock} children={(
                  <>
                    <Input
                      {...register('password', 
                        {required: 'Heslo je povinné'
                        })
                      }
                      placeholder="••••••••"
                      className="pl-11 pr-12"
                      type={show ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="bg-transparent absolute right-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer"
                      aria-pressed={show}
                      aria-label={show ? "Skrýt heslo" : "Zobrazit heslo"}
                    >
                      {show ? (
                        <Eye className="w-5 h-5 text-gray-800/50" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-800/50" />
                      )}
                    </button>
                  </>
                )}/>

                  {errors.password && 
                  <p className='text-destructive'>{errors.password.message as string}</p>}
                  {errors.root && 
                  <p className='text-destructive'>{errors.root.message as string}</p>}

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
                >
                  {isLogin ? "Přihlásit se" : "Zaregistrovat se"}
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
  );
};

export default LoginPage;