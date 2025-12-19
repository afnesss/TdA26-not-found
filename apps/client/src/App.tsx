import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './components/layout/MainLayout';
import CoursesPage from './pages/CoursesPage';
import LoginPage from './pages/LoginPage'

function App() {
  // const [count, setCount] = useState(0)
  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />}/>
        <Route path='/courses' element={<CoursesPage />}></Route>
        <Route path='/login' element={<LoginPage />}></Route>
    </Route>
  ));

    return <RouterProvider router={router}/>;
}

export default App