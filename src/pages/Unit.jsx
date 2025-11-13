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
          </button>
        </div>
      </div>

      {/* Tabel Unit */}
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
                  <button title="Edit (opsional)" className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => removeRoom(room.id_room)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada unit ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                  placeholder=""
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
                  placeholder=""
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
    </section>
  );
}
