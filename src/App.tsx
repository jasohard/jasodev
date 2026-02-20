import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.tsx'
import HomePage from './pages/HomePage/HomePage.tsx'
import PendulumPage from './pages/PendulumPage/PendulumPage.tsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pendulum" element={<PendulumPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
