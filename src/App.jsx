import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Reservation from "./pages/Reservation";
import Dashboard from "./pages/Dashboard";
import FoodList from "./pages/FoodList";
import Games from "./pages/Games";
import Room from "./pages/Room";
import Unit from "./pages/Unit";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import Customer from "./pages/Customer";
import Membership from "./pages/Membership";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import QuickOrder from "./components/QuickOrder";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reservation" element={<Reservation />} />
          <Route path="foods" element={<FoodList />} />
          <Route path="games" element={<Games />} />
          <Route path="rooms" element={<Room />} />
          <Route path="customer" element={<Customer />} />
          <Route path="membership" element={<Membership />} />
          <Route path="unit" element={<Unit />} />
          <Route path="user" element={<Users />} />
          <Route path="user/profile" element={<UserProfile />} />
          <Route path="orderfoods" element={<QuickOrder />}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
