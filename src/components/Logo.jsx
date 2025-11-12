export default function Logo() {
return (
    <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white dark:bg-indigo-500">
            <span className="text-xs font-bold">CO</span>
        </div>
        <div className="leading-tight">
            <p className="text-sm font-semibold">Raffli Ramdhany</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
        </div>
    </div>
    )
}