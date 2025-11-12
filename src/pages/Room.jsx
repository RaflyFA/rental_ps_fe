import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'

export default function Room() {
    const [rooms, setRooms] = useState([])
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ nama_ruangan: '', harga: '' })

    useEffect(() => {
        let alive = true
        fetch('/api/rooms')
            .then((r) => { if (!r.ok) throw new Error('bad'); return r.json() })
            .then((data) => { if (alive) setRooms(data) })
            .catch(() => {
                if (!alive) return
                // untuk data room sementara
                setRooms([
                    { id_room: 1, nama_ruangan: 'Ruang Cipung', harga: 150000 },
                    { id_room: 2, nama_ruangan: 'Ruang King', harga: 200000 },
                    { id_room: 3, nama_ruangan: 'Ruang Baso ikan', harga: 500000 },
                ])
            })
        return () => { alive = false }
    }, [])

    const filtered = useMemo(
        () => rooms.filter((r) => r.nama_ruangan.toLowerCase().includes(query.toLowerCase())),
        [rooms, query]
    )

    async function createRoom(e) {
        e.preventDefault()
        const payload = { ...form, harga: Number(form.harga) }
        try {
            const r = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!r.ok) throw new Error('create failed')
            const created = await r.json() // tambahan untuk nanti { id_room, nama_ruangan, harga }
            setRooms((prev) => [created, ...prev])
            setOpen(false)
            setForm({ nama_ruangan: '', harga: '' })
        } catch (err) {
            console.error(err)
            alert('Gagal membuat ruangan. Pastikan backend POST /api/rooms sudah siap.')
        }
    }

    async function removeRoom(id) {
        const ok = confirm('Hapus ruangan ini?')
        if (!ok) return
        try {
            const r = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
            if (!r.ok) throw new Error('delete failed')
            setRooms((prev) => prev.filter((room) => room.id_room !== id))
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus ruangan.')
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Room List</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari ruangan…"
                            className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <button onClick={() => setOpen(true)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Ruangan Baru
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
                            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Nama Ruangan</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Harga/Jam</th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                        {filtered.map((room) => (
                            <tr key={room.id_room}>
                                <td className="px-4 py-3 text-sm text-gray-500">{room.id_room}</td>
                                <td className="px-4 py-3 text-sm font-medium">{room.nama_ruangan}</td>
                                <td className="px-4 py-3 text-sm">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0,
                                    }).format(Number(room.harga))}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button title="Edit (opsional)" className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => removeRoom(room.id_room)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold">Tambah Ruangan</h2>
                        <form className="mt-4 space-y-4" onSubmit={createRoom}>
                            <label className="block">
                                <span className="text-sm">Nama Ruangan</span>
                                <input
                                    required
                                    value={form.nama_ruangan}
                                    onChange={(e) => setForm((s) => ({ ...s, nama_ruangan: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder="" //tambahin placeholder kalo butuh
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm">Harga per Jam (Rupiah)</span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={form.harga}
                                    onChange={(e) => setForm((s) => ({ ...s, harga: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder=""//tambahin placeholder kalo butuh
                                />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}