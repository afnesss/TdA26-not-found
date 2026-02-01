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
import CourseDetailPage from './pages/dashboard/CourseDetailsPage'
import TermsOfUsePage from './pages/TermsOfUsePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

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
              <DashboardPage />
            </ProtectedRoute>
          }
        ></Route>

        <Route
          path='/dashboard/:courseId'
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route path='/terms-of-use' element={<TermsOfUsePage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
      </Route>,
    ),
  )

  return <RouterProvider router={router} />
}

export default App
