import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'


export default function App() {
return (
<Routes>
<Route element={<DashboardLayout />}> {/* shared chrome */}
<Route index element={<Dashboard />} />
<Route path="analytics" element={<Analytics />} />
<Route path="settings" element={<Settings />} />
<Route path="*" element={<Navigate to="/" replace />} />
</Route>
</Routes>
)
}