import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './components/layout/MainLayout'
import CoursesPage from './pages/CoursesPage/CoursesPage'
import LoginPage from './pages/LoginPage'
import CoursePage from './pages/CoursePage/ExactCoursePage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='/courses' element={<CoursesPage />}></Route>
        <Route path='/login' element={<LoginPage />}></Route>
        <Route path='/courses/:id' element={<CoursePage />}></Route>

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              {' '}
              <DashboardPage />{' '}
            </ProtectedRoute>
          }
        ></Route>
      </Route>,
    ),
  )

  return <RouterProvider router={router} />
}

export default App
