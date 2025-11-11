export default function Settings() {
return (
<section className="space-y-6">
<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
<form className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
<div className="grid gap-4 sm:grid-cols-2">
<label className="block">
<span className="text-sm text-gray-700 dark:text-gray-300">Project name</span>
<input className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" placeholder="Corona Admin" />
</label>
<label className="block">
<span className="text-sm text-gray-700 dark:text-gray-300">Timezone</span>
<select className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
<option>UTC</option>
<option>Asia/Jakarta</option>
</select>
</label>
</div>
<div className="mt-6">
<button type="button" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600">Save</button>
</div>
</form>
</section>
)
}