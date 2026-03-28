import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './components/layout/MainLayout'
import CoursesPage from './pages/CoursesPage/CoursesPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './auth/ProtectedRoute'
import OrganizationProtectedRoute from './auth/OrganizationProtectedRoute'
import OrganizationStatusWatcher from './auth/OrganizationStatusWatcher'
import CourseModuleDetailPage from './pages/dashboard/ModuleDetailPage'
import CourseModulesLayoutPage from './pages/dashboard/CourseModulesLayoutPage'
import CourseModulesOverviewPage from './pages/dashboard/CourseOverviewPage'
import UserCourseLayoutPage from './pages/course-user/UserCourseLayoutPage'
import UserCourseOverviewPage from './pages/course-user/UserCourseOverviewPage'
import UserCourseModuleDetailPage from './pages/course-user/UserCourseModuleDetailPage'
import TermsOfUsePage from './pages/TermsOfUsePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import NotFoundPage from './pages/NotFoundPage'
import OrganizationRequestPage from './pages/OrganizationRequestPage'
import OrganizationRequestStatusPage from './pages/OrganizationRequestStatusPage'
import AdminRequestsPage from './pages/admin/AdminRequestsPage'
import AdminOrganizationsPage from './pages/admin/AdminOrganizationsPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrganizationHomePage from './pages/OrganizationHomePage'
import OrganizationInfoPage from './pages/OrganizationInfoPage'
import OrganizationLoginPage from './pages/OrganizationLoginPage'
import OrganizationPasswordPage from './pages/OrganizationPasswordPage'
import CourseShareRedirectPage from './pages/course-share/CourseShareRedirectPage'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='/organization-request/new' element={<OrganizationRequestPage />} />
        <Route
          path='/organization-request/:requestId'
          element={<OrganizationRequestStatusPage />}
        />
        <Route path='/course-share/:token' element={<CourseShareRedirectPage />} />
        <Route path='/courses/*' element={<NotFoundPage />} />
        <Route path='/login' element={<Navigate to='/' replace />} />
        <Route path='/dashboard/*' element={<NotFoundPage />} />
        <Route path='/terms-of-use' element={<TermsOfUsePage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/admin/login' element={<LoginPage />} />
        <Route
          path='/admin/requests'
          element={
            <ProtectedRoute>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/requests/:requestId'
          element={
            <ProtectedRoute>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/organizations'
          element={
            <ProtectedRoute>
              <AdminOrganizationsPage />
            </ProtectedRoute>
          }
        />
        <Route path='/:orgSlug' element={<OrganizationStatusWatcher />}>
          <Route index element={<OrganizationHomePage />} />
          <Route path='info' element={<OrganizationInfoPage />} />
          <Route path='login' element={<OrganizationLoginPage />} />
          <Route
            path='settings/password'
            element={
              <OrganizationProtectedRoute allowPasswordChangeOnly>
                <OrganizationPasswordPage />
              </OrganizationProtectedRoute>
            }
          />
          <Route path='courses' element={<CoursesPage />}></Route>
          <Route path='courses/:courseId/' element={<UserCourseLayoutPage />}>
            <Route index element={<UserCourseOverviewPage />} />
            <Route
              path='modules/:moduleId'
              element={<UserCourseModuleDetailPage />}
            />
          </Route>
          <Route
            path='dashboard'
            element={
              <OrganizationProtectedRoute>
                <DashboardPage />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path='dashboard/:courseId/'
            element={
              <OrganizationProtectedRoute>
                <CourseModulesLayoutPage />
              </OrganizationProtectedRoute>
            }
          >
            <Route index element={<CourseModulesOverviewPage />} />
            <Route
              path='modules/:moduleId'
              element={<CourseModuleDetailPage />}
            />
          </Route>
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Route>,
    ),
  )

  return <RouterProvider router={router} />
}

export default App
