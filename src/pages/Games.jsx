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
          </button>
        </div>
      </div>

      {/* Tabel Game */}
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
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="inline-flex items-center rounded-lg p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {games.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Belum ada game
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
