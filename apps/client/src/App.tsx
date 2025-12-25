import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './components/layout/MainLayout';
import CoursesPage from './pages/CoursesPage/CoursesPage';
import LoginPage from './pages/LoginPage'
import CoursePage from './pages/ExactCoursePage';

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />}/>
        <Route path='/courses' element={<CoursesPage />}></Route>
        <Route path='/login' element={<LoginPage />}></Route>
        <Route path='/courses/:uuid' element={<CoursePage />}></Route>
    </Route>
  ));

    return <RouterProvider router={router}/>;
}

export default App