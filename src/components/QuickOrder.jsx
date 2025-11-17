import { useEffect, useMemo, useState } from 'react'
import { Plus, Minus, ShoppingCart, Trash2, Search } from 'lucide-react'
import { useSearchParams } from "react-router-dom";

const fmtIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n || 0))
export default function QuickOrder() {
    const [foods, setFoods] = useState([])
    const [query, setQuery] = useState('')
    const [searchParams] = useSearchParams()
    const reservationId = searchParams.get("reservation") || ""
    const reservationName = searchParams.get("customer") || ""
    const reservationRoom = searchParams.get("rooms") || ""
    const reservationStart = searchParams.get("start") || ""
    const reservationEnd = searchParams.get("end") || ""
    let reservationTimeText = "";
    if (reservationStart && reservationEnd) {
        const start = new Date(reservationStart);
        const end   = new Date(reservationEnd);
        const startText = start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        const endText = end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        reservationTimeText = `${startText} - ${endText}`;
    }""
    const [cart, setCart] = useState({})
    useEffect(() => {
        let alive = true
        fetch('/api/foods')
        .then((r) => { if (!r.ok) throw new Error('bad'); return r.json() })
        .then((data) => { if (alive) setFoods(data) })
        .catch(() => {
            if (!alive) return
            setFoods([
                { id_food: 1, nama_makanan: 'Mie Goreng Instan', harga: 12000 },
                { id_food: 2, nama_makanan: 'Mie Rebus Instan', harga: 12000 },
                { id_food: 3, nama_makanan: 'Nasi Goreng Spesial', harga: 18000 },
                { id_food: 4, nama_makanan: 'Nasi Ayam Geprek', harga: 20000 },
                { id_food: 5, nama_makanan: 'Kentang Goreng', harga: 10000 },
                { id_food: 10, nama_makanan: 'Teh Panas', harga: 5000 },
                { id_food: 12, nama_makanan: 'Kopi Hitam Panas', harga: 8000 },
                { id_food: 14, nama_makanan: 'Jus Alpukat', harga: 12000 },
            ])
        })
        return () => { alive = false }
    }, [])
    const filtered = useMemo(() =>foods.filter((f) => f.nama_makanan.toLowerCase().includes(query.toLowerCase())),[foods, query])
    const items = Object.entries(cart).map(([id, qty]) => ({qty, food: foods.find((f) => String(f.id_food) === String(id)), })).filter((i) => i.food)
    const total = items.reduce((s, i) => s + Number(i.food.harga) * i.qty, 0)
    const add = (f) => setCart((c) => ({ ...c, [f.id_food]: (c[f.id_food] || 0) + 1 }))
    const dec = (f) => setCart((c) => {
        const next = (c[f.id_food] || 0) - 1
        const { [f.id_food]: _drop, ...rest } = c
        return next > 0 ? { ...c, [f.id_food]: next } : rest
    })
    const remove = (id) => setCart((c) => {
        const next = { ...c }
        delete next[id]
        return next
    })
    async function placeOrder() {
        const payload = {reservation_id: Number(reservationId), items: items.map((i) => ({ food_id: i.food.id_food, jumlah: i.qty })),
        }
        try {
            const r = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!r.ok) throw new Error('Failed to create order')
            setCart({})
            alert('Order berhasil dibuat!')
        } catch (e) {
            console.error(e)
            alert('Gagal membuat order. Periksa URL API backend Anda.')
        }
    }
    return (
        <div>
            <div className="p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Quick Order</h2>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari makanan…"
                        className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {filtered.map((f) => (
                            <div key={f.id_food} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <p className="font-medium">{f.nama_makanan}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{fmtIDR(f.harga)}</p>
                                <div className="mt-4 flex items-center gap-2">
                                {cart[f.id_food] ? (
                                    <>
                                    <button onClick={() => dec(f)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:hover:bg-gray-800"><Minus className="h-4 w-4" /></button>
                                    <span className="w-8 text-center text-sm font-medium">{cart[f.id_food]}</span>
                                    <button onClick={() => add(f)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:hover:bg-gray-800"><Plus className="h-4 w-4" /></button>
                                    </>
                                ) : (
                                <button onClick={() => add(f)} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600">Tambah</button>
                                )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="flex items-center gap-2 text-base font-semibold"><ShoppingCart className="h-5 w-5" /> Keranjang</h3>
                        {items.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Belum ada item.</p>
                        ) : (
                            <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                                {items.map(({ food, qty }) => (
                                    <li key={food.id_food} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium leading-tight">{food.nama_makanan}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{qty} × {fmtIDR(food.harga)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => dec(food)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"><Minus className="h-4 w-4" /></button>
                                            <span className="w-8 text-center text-sm font-medium">{qty}</span>
                                            <button onClick={() => add(food)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"><Plus className="h-4 w-4" /></button>
                                            <button onClick={() => remove(food.id_food)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                            <span className="text-gray-700 dark:text-gray-300">Reservasi</span>
                            <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                              {reservationId ? (
                                <>
                                  <div>ID Reservasi {reservationId}</div>
                                  {reservationName && <div>Pelanggan: {reservationName}</div>}
                                  {reservationRoom && <div>Ruangan: {reservationRoom}</div>}
                                  {reservationTimeText && <div>Waktu: {reservationTimeText}</div>}
                                </>
                              ) : (
                                <>Tidak ada reservasi terpilih (buka dari halaman reservasi)</>
                              )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-xl font-bold">{fmtIDR(total)}</p>
                            </div>
                            <button
                                disabled={items.length === 0 || !reservationId}
                                onClick={placeOrder}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                                <ShoppingCart className="h-5 w-5" /> Buat Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
