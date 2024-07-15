import cls from 'classnames'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Lunch from './pages'

import styles from './App.module.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <center>
        <h1>No support this site</h1>
      </center>
    ),
    errorElement: (
      <center>
        <h1>Can not load this site</h1>
      </center>
    ),
  },
  {
    path: '/:type',
    element: <Lunch />,
  },
  {
    path: '/:type/:id',
    element: <Lunch />,
  },
])

function App() {
  return (
    <main className={cls(styles.main, styles.light)}>
      <RouterProvider router={router} />
    </main>
  )
}

export default App
