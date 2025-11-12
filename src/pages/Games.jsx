<<<<<<< HEAD
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function Games() {
  // Data dummy (belum dari backend)
  const [games] = useState([
    { id: 1, name: "FIFA 24", unit: "Unit A" },
    { id: 2, name: "Tekken 8", unit: "Unit B" },
  ]);

  // Daftar pilihan unit ( aku kepikiran pake dropdown karena nanti kan ini diambil dari tabel unit berdasarkan id unit nya )
  const unitOptions = ["Unit A", "Unit B", "Unit C", "Unit D"];

  // Data form (frontend only)
  const [newGame, setNewGame] = useState({ name: "", unit: "" });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">List Game</h1>

      {/* Form Tambah Game */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Tambah Game</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Input Nama Game */}
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Nama Game</span>
            <input
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Contoh: FIFA 24"
              value={newGame.name}
              onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
            />
          </label>

          {/* Dropdown Nama Unit */}
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Nama Unit</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={newGame.unit}
              onChange={(e) => setNewGame({ ...newGame, unit: e.target.value })}
            >
              <option value="">-- Pilih Unit --</option>
              {unitOptions.map((unit, index) => (
                <option key={index} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Tombol Tambah (belum ada fungsi) */}
        <div className="mt-6">
          <button
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} /> Tambah Game
=======
import { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

export default function Games() {
  // Data dummy (frontend only)
  const [games] = useState([
    { id: 1, name: "FIFA 24", unit: "Unit A" },
    { id: 2, name: "Tekken 8", unit: "Unit B" },
    { id: 3, name: "eFootball 2025", unit: "Unit C" },
  ]);

  // State pencarian & modal
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Form tambah game (dummy)
  const [newGame, setNewGame] = useState({ name: "", unit: "" });
  const unitOptions = ["Unit A", "Unit B", "Unit C", "Unit D"];

  // Filter hasil pencarian
  const filtered = useMemo(() => {
    return games.filter((g) =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [games, query]);

  return (
    <section className="space-y-6">
      {/* Header + Search + Tombol Tambah */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">List Game</h1>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari game…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Tombol tambah */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Game
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
          </button>
        </div>
      </div>

      {/* Tabel Game */}
<<<<<<< HEAD
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-2">No</th>
              <th className="py-2">Nama Game</th>
              <th className="py-2">Nama Unit</th>
              <th className="py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr
                key={game.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{game.name}</td>
                <td className="py-2">{game.unit}</td>
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
                Nama Game
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama Unit
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {filtered.map((game, index) => (
              <tr key={game.id}>
                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{game.name}</td>
                <td className="px-4 py-3 text-sm">{game.unit}</td>
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
            {games.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Belum ada game
=======
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada game ditemukan
>>>>>>> 5c9038e7ca372d0ac4ff7b7230e5ec13f4909c0d
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
<<<<<<< HEAD
=======

      {/* Modal Tambah Game */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Tambah Game</h2>
            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm">Nama Game</span>
                <input
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Contoh: FIFA 24"
                />
              </label>
              <label className="block">
                <span className="text-sm">Nama Unit</span>
                <select
                  value={newGame.unit}
                  onChange={(e) =>
                    setNewGame((s) => ({ ...s, unit: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Unit --</option>
                  {unitOptions.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
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
