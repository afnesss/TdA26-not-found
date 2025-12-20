import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from '../assets/blue_logo.png'
import HintPageText from '@/components/shared/HintPageText';
import { Input } from '@/components/ui/input';
import LogoAnim from '@/components/shared/LogoAnim';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="max-w-6xl mx-auto overflow-hidden grid h-full md:grid-cols-2 lg:grid-cols-2">
      {/* Left side - Welcome content */}
      <div className='relative justify-center h-full hidden md:flex items-center px-4 md:pl-6 lg:pl-10 lg:pr-20'>
        <div className="space-y-8 text-left">

          <HintPageText icon={Sparkles} text='Začněte svou cestu'/>

        <h1 className="max-sm:text-2xl text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          <span className="relative inline-block mb-2">
            Vítejte zpět v
            <svg 
              className="absolute -bottom-1 left-0 w-full overflow-visible" 
              height="12" 
              viewBox="0 0 400 12"
              preserveAspectRatio="none"
            >
              <path 
                d="M0,10 Q50,3 110,9 Q150,14 200,4 Q250,2 300,11 Q350,15 400,6"
                stroke="#91F5AD" 
                strokeWidth="5" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br/>
          <span className="text-primary">Think Different Academy</span>
        </h1>

          {/* Animated logo section */}
          <div className="relative flex items-center justify-center pt-8">
            <LogoAnim sizeBlur1='w-40 h-40' sizeBlur2='w-48 h-48'/>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
            }
          `}</style>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="px-2 md:px-6 lg:px-10 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border border-foreground/10">
            {/* Header with linear */}
            <div className="relative bg-linear-to-r from-primary to-accent-blue text-xl font-semibold text-background flex items-center justify-center py-5">
              <span className="relative z-10">{!isLogin ? "Vytvořit účet" : "Přihlášení"}</span>
            </div>

            {/* Form content */}
            <div className="px-6 lg:px-8 py-8 bg-background/95">
              <div className="flex flex-col gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Jméno
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                      <Input
                        type="text"
                        placeholder="Jan Novák"
                        className=" pl-11 pr-4"
                      />
                    </div>
                  </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Heslo
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <Input
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
                  </div>
                </div>

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

                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 rounded-xl cursor-pointer bg-linear-to-r from-accent-teal to-primary text-background font-bold hover:from-accent-teal-dark hover:to-accent-blue transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-102 text-base mt-2"
                >
                  {isLogin ? "Přihlásit se" : "Zaregistrovat se"}
                </button>

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
              </div>
            </div>

            {/* Bottom colored bar */}
            {/* <div className="h-2 bg-linear-to-r from-secondary via-accent-teal-light to-accent-teal"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;