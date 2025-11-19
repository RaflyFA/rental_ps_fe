import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const itemMax = 5; // sama seperti foodlist.jsx

export default function Unit() {
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [newUnit, setNewUnit] = useState({
    id: null,
    unit: "",
    room: "",
    description: "",
  });

  const [notif, setNotif] = useState(null);

  const [page, setPage] = useState(1);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };
  useEffect(() => {
    fetchUnits();
    fetchRooms();
  }, []);

  const fetchUnits = async () => {
    try {
      const data = await apiGet("/unit");
      setUnits(data);
    } catch (err) {
      showNotif("Gagal memuat unit", "error");
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await apiGet("/room");
      setRooms(data);
    } catch (err) {
      showNotif("Gagal memuat room", "error");
    }
  };
  useEffect(() => {
    setPage(1);
  }, [query]);

  // =============================
  // SAVE (CREATE / UPDATE)
  // =============================
  const saveUnit = async () => {
    const payload = {
      nama_unit: newUnit.unit,
      id_room: Number(newUnit.room),
      deskripsi: newUnit.description,
    };

    const isEdit = newUnit.id !== null;

    try {
      if (isEdit) {
        await apiPut(`/unit/${newUnit.id}`, payload);
        showNotif("Unit berhasil diubah");
      } else {
        await apiPost("/unit", payload);
        showNotif("Unit berhasil ditambahkan");
      }

      setOpen(false);
      setNewUnit({ id: null, unit: "", room: "", description: "" });
      fetchUnits();
    } catch (err) {
      showNotif("Gagal menyimpan unit", "error");
    }
  };

  // =============================
  // DELETE
  // =============================
  const doDelete = async () => {
    try {
      await apiDelete(`/unit/${deleteConfirm.id}`);
      showNotif("Unit berhasil dihapus");
      fetchUnits();
    } catch (err) {
      showNotif("Gagal menghapus unit", "error");
    }
    setDeleteConfirm({ open: false, id: null });
  };

  // =============================
  // OPEN EDIT
  // =============================
  const openEdit = (u) => {
    setNewUnit({
      id: u.id_unit,
      unit: u.nama_unit,
      room: u.id_room,
      description: u.deskripsi ?? "",
    });

    setOpen(true);
  };

  // =============================
  // FILTER + PAGINATION
  // =============================
  const filtered = useMemo(() => {
    return units.filter(
      (u) =>
        u.nama_unit.toLowerCase().includes(query.toLowerCase()) ||
        u.room?.nama_room.toLowerCase().includes(query.toLowerCase())
    );
  }, [units, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemMax));
  const currentPage = Math.min(page, pageCount);

  const startIndex = (currentPage - 1) * itemMax;
  const paginatedUnits = filtered.slice(startIndex, startIndex + itemMax);

  const from = filtered.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + itemMax, filtered.length);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">List Unit</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              setNewUnit({ id: null, unit: "", room: "", description: "" });
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Unit
          </button>
        </div>
      </div>
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
            {paginatedUnits.map((u, index) => (
              <tr key={u.id_unit}>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{u.nama_unit}</td>
                <td className="px-4 py-3 text-sm">{u.room?.nama_room ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{u.deskripsi}</td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: u.id_unit })}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedUnits.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  Tidak ada unit ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan <span className="font-semibold">{from}</span>–
          <span className="font-semibold text-gray-700 dark:text-gray-200">{to}</span> dari{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span> unit
        </p>

        <div className="inline-flex items-center gap-1 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-300">
            Halaman {currentPage} / {pageCount}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">
              {newUnit.id ? "Edit Unit" : "Tambah Unit"}
            </h2>

            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm">Nama Unit</span>
                <input
                  value={newUnit.unit}
                  onChange={(e) => setNewUnit((s) => ({ ...s, unit: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm">Nama Room</span>
                <select
                  value={newUnit.room}
                  onChange={(e) => setNewUnit((s) => ({ ...s, room: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Room --</option>

                  {rooms.map((r) => (
                    <option key={r.id_room} value={r.id_room}>
                      {r.nama_room}
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
                  onClick={saveUnit}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-w-sm w-full bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Hapus Unit?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>

              <button
                onClick={doDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {notif && (
        <div
          className={`
            fixed bottom-6 right-6 z-'9999'
            rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300
            ${
              notif.type === "error"
                ? "bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                : "bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
            }
          `}
        >
          {notif.msg}
        </div>
      )}
    </section>
  );
}
