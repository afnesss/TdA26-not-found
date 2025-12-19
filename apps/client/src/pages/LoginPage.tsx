// import { useState } from 'react'
// import { Eye, EyeOff, X } from 'lucide-react'
// import {Button} from '../components/ui/button';
// // import { useNavigate } from 'react-router-dom';
// // import { useModalStore } from '../../stores/useZustStore';

// const LoginPage = () => {
//   // const closeLogin = useModalStore((state) => state.closeLogin)
//   // const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(true);
//   const[show, setShow] = useState(false);

//   return (
//     <div className="absolute inset-0 bg-linear-to-br from-foreground/20 to-primary/10 backdrop-blur-sm z-40 ">
//       <div className="center-box">
//         <div className="pop-box text-center py-3 lg:py-4 px-2 lg:px-3 w-full max-w-md m-3 relative overflow-hidden">
          
//           {/* Header s linearem */}
//           <div className="absolute top-0 left-0 right-0 bg-linear-to-r from-primary to-accent-blue text-lg lg:text-2xl font-semibold text-background flex items-center justify-center py-2.5 lg:py-5 rounded-t-xl shadow-lg">
//             {/* <X className='w-5 h-5 lg:w-6 lg:h-6 absolute top-3 right-5 text-background hover:text-secondary cursor-pointer z-50' onClick={close}></X> */}
//             <span className="relative z-10">{!isLogin ? "Sign Up" : "Log In"}</span>
//             {/* Dekorativní element */}
//             <div className="absolute inset-0 bg-linear-to-b from-background/10 to-transparent"></div>
//           </div>

//           <div className="pt-17 lg:pt-20 pb-6 bg-background">
//             <form method="POST" className="w-full px-3 lg:px-6">
//               <div className="flex flex-col gap-4">
                
//                 <div className="space-y-4">
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     className="w-full px-3 lg:px-4 py-1 lg:py-3 rounded-lg focus-ring-input
//                              transition-all duration-200 outline-none placeholder:text-sm lg:placeholder:text-base"
//                   />
//                   <div className='relative'>
//                   <input
//                     placeholder="Password"
//                     className="w-full px-3 py-1 lg:py-3 rounded-lg focus-ring-input
//                              transition-all duration-200 outline-none placeholder:text-sm lg:placeholder:text-base"
//                     type={show ? 'text' : 'password'}
//                   />
//                   <button
//                   type="button"
//                   onClick={() => setShow((s) => !s)}
//                   className="bg-transparent absolute right-3 inset-y-0 flex items-center cursor-pointer"
//                   aria-pressed={show}
//                   aria-label={show ? "Hide password" : "Show password"}
//                 >
//                   {show ? <Eye className="w-4 h-4 lg:w-10 lg:h-5 text-gray-800/50"/> : <EyeOff className="w-4 h-4 lg:w-10 lg:h-5 text-gray-800/50" />}
//                 </button>

//                   </div>

//                 </div>

//               <Button variant='primary' size="primary">{isLogin ? "Sign In" : "Register"}</Button>
                  

//                 <p className="text-sm text-gray-600 mt-3">
//                   {isLogin ? "Don't have an account? " : "Already have an account? "}
//                   <button
//                     type="button"
//                     onClick={() => setIsLogin(!isLogin)}
//                     className="text-accent-teal-light hover:text-accent-teal font-semibold 
//                              transition-colors duration-200 underline-offset-2 hover:underline"
//                   >
//                     {isLogin ? "Sign Up" : "Log In"}
//                   </button>
//                 </p>
//               </div>
//             </form>
//           </div>

//           <div className="h-1 bg-linear-to-r from-secondary via-accent-teal-light to-accent-teal rounded-b-xl"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion';
import logo from "../assets/blue_logo.png";
import { Button } from '@/components/ui/button';


const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="max-w-7xl mx-auto overflow-hidden grid h-full grid-cols-2">
      {/* Animated background elements matching HomePage */}
            <div className='col-span-1 relative  items-center justify-center h-full hidden md:flex'>

        <div className='absolute inset-0 flex items-center justify-center'>

          <motion.div 
            className='absolute w-72 h-72 bg-secondary rounded-full blur-3xl'
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className='absolute w-80 h-80 bg-accent-teal-light rounded-full blur-3xl'
            animate={{
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

        </div>

        <motion.div className='relative z-10'>
          <motion.img 
            src={logo} 
            className='h-50 w-50 lg:h-64 lg:w-64 object-contain'
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(69, 123, 255, 0.3)) drop-shadow(0 10px 20px rgba(145, 245, 173, 0.2))'
            }}
          />
        </motion.div>

      </div>

      {/* Main content */}
<div className=" px-4 sm:px-6 lg:px-12 flex items-center ">

          
          {/* Left side - Welcome content */}
          {/* <div className="space-y-8 text-center lg:text-left">
            {/* <div className="inline-block">
              <div className="flex items-center gap-3 bg-secondary/30 backdrop-blur-sm px-5 py-2.5 rounded-full border border-accent-teal-light/30">
                <Sparkles className="w-5 h-5 text-accent-teal" />
                <span className="text-sm font-semibold text-foreground">Začněte svou cestu</span>
              </div>
            </div> */}




          {/* Right side - Login form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-foreground/10">
              {/* Header with linear */}
              <div className="relative bg-linear-to-r from-primary to-accent-blue text-xl font-semibold text-background flex items-center justify-center py-5">
                <span className="relative z-10">{!isLogin ? "Vytvořit účet" : "Přihlášení"}</span>
                {/* Decorative overlay */}
              </div>

              {/* Form content */}
              <div className="px-6 lg:px-8 py-8 bg-background/95">
                <div className="flex flex-col gap-5">
                  
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Celé jméno
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                        <input
                          type="text"
                          placeholder="Jan Novák"
                          className="w-full pl-11 pr-4 py-3 rounded-lg focus-ring-input transition-all duration-200 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                      <input
                        type="email"
                        placeholder="vas@email.cz"
                        className="w-full pl-11 pr-4 py-3 rounded-lg focus-ring-input transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Heslo
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                      <input
                        className="w-full pl-11 pr-12 py-3 rounded-lg focus-ring-input transition-all duration-200 outline-none"
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

                  {isLogin && (
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
                  )}

                  <Button
                  variant='primary' 
                  size="primary"
                    onClick={handleSubmit}
                    className="w-full"
                  >
                    {isLogin ? "Přihlásit se" : "Zaregistrovat se"}
                  </Button>

                  <p className="text-sm text-gray-600 text-center mt-2">
                    {isLogin ? "Nemáte účet? " : "Již máte účet? "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-accent-teal-light hover:text-accent-teal font-semibold transition-colors duration-200 underline-offset-2 hover:underline"
                    >
                      {isLogin ? "Zaregistrujte se" : "Přihlaste se"}
                    </button>
                  </p>
                </div>
              </div>

              {/* Bottom colored bar */}
              <div className="h-1.5 bg-linear-to-r from-secondary via-accent-teal-light to-accent-teal"></div>
            </div>
          </div>

        </div>
      </div>
    
  );
};

export default LoginPage;