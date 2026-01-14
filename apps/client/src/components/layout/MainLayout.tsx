import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router'

const MainLayout = () => {
  return (
    <div className='flex flex-col h-dvh overflow-hidden'>
      <Header />
      <section className='flex-1 p-2 overflow-y-auto sm:p-5 bg-linear-to-b from-accent-teal-dark/10 to-accent-teal/10 hide-scrollbar'>
        <Outlet />
      </section>
    </div>
  )
}

export default MainLayout
