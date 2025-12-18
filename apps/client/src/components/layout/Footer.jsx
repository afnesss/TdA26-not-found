import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="w-full h-10 flex bg-foreground px-4 sm:px-8 md:px-12 lg:px-20">
        <div className='text-gray-500 text-xs font-semibold flex flex-row w-full justify-between items-center'>
          <div className='flex flex-row gap-10'>© 2025 Think different Academy
          <div className='w-40 flex-row justify-between hidden sm:flex'>
            {/* <span className='hover:text-brand-light cursor-pointer'>O nas</span> */}
            <span className='hover:text-secondary cursor-pointer' onClick={() =>{navigate('/courses')}}>Kurzy</span>
            {/* <span className='hover:text-brand-light cursor-pointer'>Kontakty</span> */}
          </div>
        </div>

          
          <span>info@thinkdifferent.academy</span>

      </div>
    </div>
    </>
  )
}

export default Footer