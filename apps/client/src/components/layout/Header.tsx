import logo from "../../assets/white_logo.png";
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../ui/button';

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full h-22 flex">
        <div className="w-1/2 bg-accent-blue px-4 sm:px-8 md:px-12 lg:px-20 flex items-center">
          <img src={logo} className="h-15 sm:h-17 md:h-18 w-auto py-3 cursor-pointer hover:scale-102 transition-all duration-200" onClick={() => navigate('/')}/>
        </div>
        <div className="w-1/2 flex px-4 sm:px-8 md:px-12 lg:px-20 items-center justify-end-safe bg-primary">
          <Button variant={'secondary'} onClick={()=> {navigate('/login')}}>Přihlásit se</Button>
        </div>
    </div>
    </>
  )
}