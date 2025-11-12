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
          </button>
        </div>
      </div>

      {/* Tabel Unit */}
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

            {units.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  Belum ada unit
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
