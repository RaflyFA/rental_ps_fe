import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Settings,
  LucideGamepad2,
  Monitor,
  UtensilsCrossed,
  DoorOpen,
  SquareUserRound,
  IdCard,
  User,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import { useAuthStore } from "../store/useAuthStore";

const baseNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reservation", label: "Reservation", icon: CalendarRange },
  { to: "/games", label: "List Game", icon: LucideGamepad2 },
  { to: "/unit", label: "Unit Playstation", icon: Monitor },
  { to: "/foods", label: "Food List", icon: UtensilsCrossed },
  { to: "/rooms", label: "Room", icon: DoorOpen },
  { to: "/customer", label: "Customer", icon: SquareUserRound },
  { to: "/membership", label: "Membership", icon: IdCard }
];

// NOTE: We will resolve the final nav below based on the current user's role. Owners see full user management, staff see "Akun Saya" (profile), customers don't see a user nav.

function Item(props) {
  const { to, label, icon: Icon, end } = props
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div
          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors
${
            isActive
              ? "bg-indigo-600 text-white dark:bg-indigo-500"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }
          `}
        >
          <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
          <span>{label}</span>
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout()
      .catch((error) => {
        console.error("Logout gagal", error);
      })
      .finally(() => {
        navigate("/login", { replace: true });
      });
  };

  // Build nav based on role
  const role = (user?.role || "").toLowerCase();
  let nav = [...baseNav];

  if (role === "owner" || role === "admin") {
    // owner gets full user management
    nav.push({ to: "/user", label: "User", icon: User });
  } else if (role === "staff") {
    // staff see personal account link instead of full user management
    nav.push({ to: "/user/profile", label: "Akun Saya", icon: User });
  } else {
    // customers: do not add any user nav
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-xl transition-transform dark:bg-gray-900 lg:translate-x-0 lg:shadow-none
${open ? "translate-x-0" : "-translate-x-full"}`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between px-2">
        <Logo />
        <button
          className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mt-6 space-y-1">
        {nav.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-red-400 dark:from-red-600 dark:to-rose-600"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <LogOut size={18} />
          Logout
        </span>
      </button>
    </aside>
  );
}
