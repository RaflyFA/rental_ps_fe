import { Menu, Moon, SunMedium } from 'lucide-react'
export default function Topbar({ onMenu, dark, setDark }) {
return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 lg:left-64">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <button
                    onClick={onMenu}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
                    aria-label="Open menu">
                <Menu className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">Admin</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setDark(!dark)}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Toggle dark mode"
                    title="Toggle theme">
                    {dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    </header>
    )
}