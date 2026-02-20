import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.tsx'
import HomePage from './pages/HomePage/HomePage.tsx'
import PendulumPage from './pages/PendulumPage/PendulumPage.tsx'
import PlinkoGame from './games/plinko/PlinkoGame.tsx'
import ProofPinball from './games/proofPinball/components/ProofPinball.tsx'
import VectorVoyager from './games/vectorVoyager/VectorVoyager.tsx'
import TrigTurntable from './games/trigTurntable/TrigTurntable.tsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pendulum" element={<PendulumPage />} />
        <Route path="plinko" element={<PlinkoGame />} />
        <Route path="proof-pinball" element={<ProofPinball />} />
        <Route path="vectors" element={<VectorVoyager />} />
        <Route path="trig" element={<TrigTurntable />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
