import React, { useState } from 'react'
import logo from "../../assets/white_logo.png";
import { useNavigate, useLocation } from 'react-router';

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full h-22 flex">
        <div className="w-1/2 bg-accent-blue px-4 sm:px-8 md:px-12 lg:px-20 flex items-center">
          <img src={logo} className="h-15 sm:h-17 md:h-18 w-auto py-3 cursor-pointer hover:scale-102 transition-all duration-200" onClick={() => navigate('/')}/>
        </div>
        <div className="w-1/2 flex px-4 sm:px-8 md:px-12 lg:px-20 items-center justify-end-safe bg-primary">
          <button className='bg-background cursor-pointer text-accent-blue transition-colors duration-300 shadow-md rounded-lg px-4 py-2 hover:bg-secondary font-semibold' onClick={()=> {navigate('/login')}}>Přihlásit se</button>
        </div>
    </div>
    </>
  )
}