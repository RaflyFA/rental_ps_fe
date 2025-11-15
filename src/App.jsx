import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Reservation'
import Settings from './pages/Settings'
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
    <Route path="customer" element={<Room />} />
    <Route path="membership" element={<Room />} />
    <Route path="unit" element={<Unit />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
</Routes>
)
}
