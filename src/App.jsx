import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
<<<<<<< HEAD
import Games from './pages/Games'
import Unit from './pages/Unit'



export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="games" element={<Games />} />
        <Route path="unit" element={<Unit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
=======
import FoodList from './pages/FoodList'
import Games from './pages/Games'
import Room from './pages/Room'
import Unit from './pages/Unit'


export default function App() {
return (
<Routes>
  <Route element={<DashboardLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="foods" element={<FoodList />} />
    <Route path="games" element={<Games />} />
    <Route path="rooms" element={<Room />} />
    <Route path="unit" element={<Unit />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
</Routes>
)
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
}
