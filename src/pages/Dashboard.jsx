export default function Dashboard() {
    return(
        <section className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{
            ['Users', 'Sales', 'Sessions', 'Conversion'].map((t) => (
                <div key={t} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t}</p>
                    <p className="mt-2 text-2xl font-semibold">—</p>
                </div>
            ) ) }
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">Chart Placeholder</p>
                <div className="mt-4 h-48 w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700"/>
            </div>
        </section>
    )
}