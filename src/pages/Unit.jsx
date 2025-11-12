<<<<<<< HEAD
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function Unit() {
  // Data dummy 
  const [units] = useState([
    { id: 1, room: "Room A", description: "Ruangan utama untuk game console", unit: "Unit A" },
    { id: 2, room: "Room B", description: "Ruangan untuk VR dan simulasi balap", unit: "Unit B" },
  ]);

  // Daftar pilihan room ( ini sama kayak kasusnya di games.jsx )
  const roomOptions = ["Room A", "Room B", "Room C", "Room D"];

  // Data form 
  const [newUnit, setNewUnit] = useState({ room: "", description: "", unit: "" });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">List Unit</h1>

      {/* Form Tambah/Edit */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Tambah Unit</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Dropdown Nama Room */}
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Nama Room</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={newUnit.room}
              onChange={(e) => setNewUnit({ ...newUnit, room: e.target.value })}
            >
              <option value="">-- Pilih Room --</option>
              {roomOptions.map((room, index) => (
                <option key={index} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </label>

          {/* Input Deskripsi */}
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Deskripsi</span>
            <input
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Deskripsi singkat room"
              value={newUnit.description}
              onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
            />
          </label>

          {/* Input Nama Unit */}
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Nama Unit</span>
            <input
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Contoh: Unit A"
              value={newUnit.unit}
              onChange={(e) => setNewUnit({ ...newUnit, unit: e.target.value })}
            />
          </label>
        </div>

        {/* Tombol Tambah (dummy, belum ada fungsi) */}
        <div className="mt-6">
          <button
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} /> Tambah Unit
=======
import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

export default function Unit() {
  // Data dummy
  const [units] = useState([
    { id: 1, unit: "Unit A", room: "Room A", description: "Ruangan utama untuk game console"},
    { id: 2, unit: "Unit B", room: "Room B", description: "Ruangan untuk VR dan simulasi balap"},
  ]);

  // State modal & search
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Form dummy
  const [newUnit, setNewUnit] = useState({
    unit: "",
    room: "",
    description: "",
  });

  const roomOptions = ["Room A", "Room B", "Room C", "Room D"];

  // Filter hasil pencarian
  const filtered = useMemo(() => {
    return units.filter(
      (u) =>
        u.unit.toLowerCase().includes(query.toLowerCase()) ||
        u.room.toLowerCase().includes(query.toLowerCase())
    );
  }, [units, query]);

  return (
    <section className="space-y-6">
      {/* Header + Search + Tombol Tambah */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">List Unit</h1>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Tombol tambah */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Unit
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
          </button>
        </div>
      </div>

      {/* Tabel Unit */}
<<<<<<< HEAD
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-2">No</th>
              <th className="py-2">Nama Unit</th>
              <th className="py-2">Nama Room</th>
              <th className="py-2">Deskripsi</th>
              <th className="py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u, index) => (
              <tr
                key={u.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{u.unit}</td>
                <td className="py-2">{u.room}</td>
                <td className="py-2">{u.description}</td>
                <td className="py-2 text-right space-x-2">
                  <button
                    className="inline-flex items-center rounded-lg p-1 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-800"
=======
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                No
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama Unit
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama Room
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Deskripsi
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {filtered.map((u, index) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{u.unit}</td>
                <td className="px-4 py-3 text-sm">{u.room}</td>
                <td className="px-4 py-3 text-sm">{u.description}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    className="inline-flex items-center rounded-lg p-1 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-800"
                    title="Edit"
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="inline-flex items-center rounded-lg p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-800"
<<<<<<< HEAD
=======
                    title="Hapus"
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

<<<<<<< HEAD
            {units.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  Belum ada unit
=======
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada unit ditemukan
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
<<<<<<< HEAD
=======

      {/* Modal Tambah Unit */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Tambah Unit</h2>
            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm">Nama Unit</span>
                <input
                  value={newUnit.unit}
                  onChange={(e) =>
                    setNewUnit((s) => ({ ...s, unit: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Contoh: Unit A"
                />
              </label>
              <label className="block">
                <span className="text-sm">Nama Room</span>
                <select
                  value={newUnit.room}
                  onChange={(e) =>
                    setNewUnit((s) => ({ ...s, room: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Room --</option>
                  {roomOptions.map((room, index) => (
                    <option key={index} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm">Deskripsi</span>
                <input
                  value={newUnit.description}
                  onChange={(e) =>
                    setNewUnit((s) => ({ ...s, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Deskripsi singkat unit"
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
                  type="button"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
    </section>
  );
}
