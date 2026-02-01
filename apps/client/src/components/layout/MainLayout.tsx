import React from 'react'
import Header from './Header'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer'

const MainLayout = () => {
  const { pathname } = useLocation()
  const isHScreen = pathname === '/' || pathname === '/login'
  return (
    <div className='flex flex-col min-h-dvh'>
      <Header />
      <section
        className={`flex-1 p-2 sm:p-5
          bg-linear-to-b from-accent-teal-dark/10 to-accent-teal/10 
          ${isHScreen ? 'flex items-center' : 'overflow-y-auto'}`}
      >
        <Outlet />
      </section>
      <Footer />
    </div>
  )
}

export default MainLayout
