import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'
export default function FoodList() {
    const [foods, setFoods] = useState([])
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ nama_makanan: '', harga: '' })
    useEffect(() => {
        let alive = true
        fetch('/api/foods')
        .then((r) => { if (!r.ok) throw new Error('bad'); return r.json() })
        .then((data) => { if (alive) setFoods(data) })
        .catch(() => {
        if (!alive) return
        // fallback sample
        setFoods([
        { id_food: 1, nama_makanan: 'Mie Goreng Instan', harga: 12000 },
        { id_food: 2, nama_makanan: 'Mie Rebus Instan', harga: 12000 },
        ])
        })
        return () => { alive = false }
    }, [])
    const filtered = useMemo(
        () => foods.filter((f) => f.nama_makanan.toLowerCase().includes(query.toLowerCase())),
        [foods, query]
    )


    async function createFood(e) {
        e.preventDefault()
        const payload = { ...form, harga: Number(form.harga) }
        try {
            const r = await fetch('/api/foods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!r.ok) throw new Error('create failed')
            const created = await r.json() // expect { id_food, nama_makanan, harga }
            setFoods((prev) => [created, ...prev])
            setOpen(false)
            setForm({ nama_makanan: '', harga: '' })
        } catch (err) {
            console.error(err)
            alert('Gagal membuat menu. Pastikan backend POST /api/foods sudah siap.')
        }
    }
    async function removeFood(id) {
        const ok = confirm('Hapus menu ini?')
        if (!ok) return
        try {
            const r = await fetch(`/api/foods/${id}`, { method: 'DELETE' })
            if (!r.ok) throw new Error('delete failed')
            setFoods((prev) => prev.filter((f) => f.id_food !== id))
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus menu.')
        }
    }
    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Food List</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari menu…"
                            className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"/>
                    </div>
                <button onClick={() => setOpen(true)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Menu Baru
                </button>
                </div>
            </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <colgroup>
                    <col style={{ width: '64px' }} />
                    <col />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '120px' }} />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">ID</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Nama</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Harga</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                    {filtered.map((f) => (
                        <tr key={f.id_food}>
                            <td className="px-4 py-3 text-sm text-gray-500">{f.id_food}</td>
                            <td className="px-4 py-3 text-sm font-medium">{f.nama_makanan}</td>
                            <td className="px-4 py-3 text-sm">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(f.harga))}</td>
                            <td className="px-4 py-3 text-right">
                            <button title="Edit (opsional)" className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => removeFood(f.id_food)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                            </td>
                        </tr>
                ) ) }
                </tbody>
            </table>
        </div>
        {open && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold">Tambah Menu</h2>
                    <form className="mt-4 space-y-4" onSubmit={createFood}>
                        <label className="block">
                            <span className="text-sm">Nama makanan</span>
                            <input required value={form.nama_makanan} onChange={(e) => setForm((s) => ({ ...s, nama_makanan: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </label>
                        <label className="block">
                            <span className="text-sm">Harga (Rupiah)</span>
                            <input required type="number" min="0" value={form.harga} onChange={(e) => setForm((s) => ({ ...s, harga: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Batal</button>
                            <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </section>
    )
}