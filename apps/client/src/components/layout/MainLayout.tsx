import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router'

const MainLayout = () => {
  // const location = useLocation();
  // const navigate = useNavigate();
  // const isLoginOpen = location.pathname === '/login';
  // const background = location.state?.background;

  //   const closeLogin = ():void => {
  //   if (background) {
  //     navigate(background);
  //   } else {
  //     navigate('/');
  //   }
  // };
  // const renderBackground = () => {
  //   if (!isLoginOpen) {
  //     return <Outlet />;
  //   }

  //   switch (background) {
  //     case '/courses':
  //       return <CoursesPage />;
  //     case '/':
  //     default:
  //       return <HomePage />;
  //   }
  // };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header/>
      <section className='flex-1 p-3 overflow-y-auto sm:p-5 bg-linear-to-b from-accent-teal-dark/10 to-accent-teal/10 hide-scrollbar'>
        <Outlet />
      </section>

    </div>
  )
}

export default MainLayout
