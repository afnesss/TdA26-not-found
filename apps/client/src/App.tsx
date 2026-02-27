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
import DashboardPage from './pages/dashboard/DashboardPage'
import ProtectedRoute from './auth/ProtectedRoute'
import CourseModuleDetailPage from './pages/dashboard/ModuleDetailPage'
import CourseModulesLayoutPage from './pages/dashboard/CourseModulesLayoutPage'
import CourseModulesOverviewPage from './pages/dashboard/CourseOverviewPage'
import UserCourseLayoutPage from './pages/course-user/UserCourseLayoutPage'
import UserCourseOverviewPage from './pages/course-user/UserCourseOverviewPage'
import UserCourseModuleDetailPage from './pages/course-user/UserCourseModuleDetailPage'
import TermsOfUsePage from './pages/TermsOfUsePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='/courses' element={<CoursesPage />}></Route>
        <Route path='/login' element={<LoginPage />}></Route>
        <Route path='/courses/:courseId/' element={<UserCourseLayoutPage />}>
          <Route index element={<UserCourseOverviewPage />} />
          <Route
            path='modules/:moduleId'
            element={<UserCourseModuleDetailPage />}
          />
        </Route>

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        ></Route>
        {/* <Route
          path='/dashboard/:courseId'
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        ></Route> */}
        <Route
          path='/dashboard/:courseId/'
          element={
            <ProtectedRoute>
              <CourseModulesLayoutPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<CourseModulesOverviewPage />} />
          <Route
            path='modules/:moduleId'
            element={<CourseModuleDetailPage />}
          />
        </Route>
        <Route path='/terms-of-use' element={<TermsOfUsePage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>,
    ),
  )

  return <RouterProvider router={router} />
}

export default App
