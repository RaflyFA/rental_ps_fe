import { NavLink } from 'react-router-dom'
<<<<<<< HEAD
import { LayoutDashboard, ChartSpline, Settings, Gamepad, Monitor,} from 'lucide-react'
=======
import { LayoutDashboard, ChartSpline, Settings, Gamepad, Monitor, UtensilsCrossed, DoorOpen } from 'lucide-react'
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
import Logo from './Logo'
const nav = [
<<<<<<< HEAD
{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
{ to: '/analytics', label: 'Analytics', icon: ChartSpline },
{ to: '/settings', label: 'Settings', icon: Settings },
{ to: '/games', label: 'List Game', icon: Gamepad },
{ to: '/unit', label: 'Unit Playstation', icon: Monitor },
=======
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/analytics', label: 'Analytics', icon: ChartSpline },
    { to: '/games', label: 'List Game', icon: Gamepad },
    { to: '/unit', label: 'Unit Playstation', icon: Monitor },
    { to: '/foods', label: 'Food List', icon: UtensilsCrossed },
    { to: '/rooms', label: 'Room', icon: DoorOpen },
    { to: '/settings', label: 'Settings', icon: Settings }
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
]

function Item(props) {
    const { to, label, icon, end } = props
    const Icon = icon
    return (
        <NavLink
        to={to}
        end={end}
        className={({ isActive }) => 
            `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors
        ${isActive ?
            'bg-indigo-600 text-white dark:bg-indigo-500': 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
        `}>
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
        </NavLink>
    )
}

export default function Sidebar({ open, onClose }) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-xl transition-transform dark:bg-gray-900 lg:translate-x-0 lg:shadow-none
                ${open ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Sidebar">
            <div className="flex items-center justify-between px-2">
                <Logo />
                <button
                    className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={onClose}
                    aria-label="Close sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div className="mt-6 space-y-1">
                {nav.map((n) => (
                    <Item key={n.to} {...n} />
                    ))}
            </div>
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <p className="font-semibold text-gray-700 dark:text-gray-200">Tip</p>
                <p>Ganti menu sesuai kebutuhan aplikasi kamu.</p>
            </div>
        </aside>
    )
}