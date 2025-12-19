import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import {Button} from '../components/ui/button';
// import { useNavigate } from 'react-router-dom';
// import { useModalStore } from '../../stores/useZustStore';
type LoginModalProps ={
  close: () => void;
}
const LoginModal = ({close}: LoginModalProps) => {
  // const closeLogin = useModalStore((state) => state.closeLogin)
  // const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const[show, setShow] = useState(false);

  return (
    <div className="absolute inset-0 bg-linear-to-br from-foreground/20 to-primary/10 backdrop-blur-sm z-40 ">
      <div className="center-box">
        <div className="pop-box text-center py-3 lg:py-4 px-2 lg:px-3 w-full max-w-md m-3 relative overflow-hidden">
          
          {/* Header s gradientem */}
          <div className="absolute top-0 left-0 right-0 bg-linear-to-r from-primary to-accent-blue text-lg lg:text-2xl font-semibold text-background flex items-center justify-center py-2.5 lg:py-5 rounded-t-xl shadow-lg">
            <X className='w-5 h-5 lg:w-6 lg:h-6 absolute top-3 right-5 text-background hover:text-secondary cursor-pointer z-50' onClick={close}></X>
            <span className="relative z-10">{!isLogin ? "Sign Up" : "Log In"}</span>
            {/* Dekorativní element */}
            <div className="absolute inset-0 bg-linear-to-b from-background/10 to-transparent"></div>
          </div>

          <div className="pt-17 lg:pt-20 pb-6 bg-background">
            <form method="POST" className="w-full px-3 lg:px-6">
              <div className="flex flex-col gap-4">
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 lg:px-4 py-1 lg:py-3 rounded-lg focus-ring-input
                             transition-all duration-200 outline-none placeholder:text-sm lg:placeholder:text-base"
                  />
                  <div className='relative'>
                  <input
                    placeholder="Password"
                    className="w-full px-3 py-1 lg:py-3 rounded-lg focus-ring-input
                             transition-all duration-200 outline-none placeholder:text-sm lg:placeholder:text-base"
                    type={show ? 'text' : 'password'}
                  />
                  <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="bg-transparent absolute right-3 inset-y-0 flex items-center cursor-pointer"
                  aria-pressed={show}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <Eye className="w-4 h-4 lg:w-10 lg:h-5 text-gray-800/50"/> : <EyeOff className="w-4 h-4 lg:w-10 lg:h-5 text-gray-800/50" />}
                </button>

                  </div>

                </div>

              <Button variant='primary' size="primary">{isLogin ? "Sign In" : "Register"}</Button>
                  

                <p className="text-sm text-gray-600 mt-3">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-accent-teal-light hover:text-accent-teal font-semibold 
                             transition-colors duration-200 underline-offset-2 hover:underline"
                  >
                    {isLogin ? "Sign Up" : "Log In"}
                  </button>
                </p>
              </div>
            </form>
          </div>

          <div className="h-1 bg-linear-to-r from-secondary via-accent-teal-light to-accent-teal rounded-b-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;