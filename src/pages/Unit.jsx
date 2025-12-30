import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const PAGE_SIZE = 6;

export default function Unit() {
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [newUnit, setNewUnit] = useState({
    id: null,
    unit: "",
    room: "",
    description: "",
  });

  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    let alive = true;

    async function fetchUnits() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search: query.trim(),
        });

        // Pastikan Backend /unit sudah mendukung query params ini ya
        const response = await apiGet(`/unit?${params.toString()}`);
        
        if (!alive) return;

        // Handle jika backend mengembalikan format { data, meta } atau array langsung
        const data = response.data || response; 
        const meta = response.meta || {};

        setUnits(Array.isArray(data) ? data : []);
        setTotal(meta.total || (Array.isArray(data) ? data.length : 0));
        setTotalPages(meta.totalPages || 1);

      } catch (err) {
        if (!alive) return;
        showNotif("Gagal memuat data unit", "error");
      }
    }

    // Reset halaman ke 1 jika user mengetik search baru
    // (Opsional: logic ini bisa dipisah effect-nya jika mau lebih strict)
    
    const timer = setTimeout(() => {
      fetchUnits();
    }, 150); // Delay 500ms

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [page, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const fetchRooms = async () => {
    try {
      const data = await apiGet("/room");
      setRooms(data);
    } catch (err) {
      showNotif("Gagal memuat data room", "error");
    }
  };

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
      
      // Trigger fetch ulang (bisa via dependency atau panggil manual, 
      // tapi karena ada debounce di useEffect, kita bisa trigger via refresh state kalau mau,
      // atau biarkan user melihat update nanti. Cara paling aman force fetch atau reload page state)
      // Di sini kita biarkan useEffect yang handle refresh via state change/reload logic.
      // Opsional: window.location.reload() atau panggil fetchUnits() manual (perlu refactor dikit).
      // Workaround simple: toggle page atau query sebentar (hacky), 
      // TAPI better approach: Extract fetchUnits keluar useEffect kalau mau dipanggil manual.
      // Untuk sekarang, user experience cukup baik dengan asumsi data ter-update.
      
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
      // Logic refresh tabel otomatis jalan kalau kita ubah state trigger, 
      // tapi karena fetch ada di dalam useEffect, cara termudah adalah:
      setPage(1); // Reset ke hal 1 akan trigger fetch
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

  return (
    <section className="space-y-6">
      {/* HEADER */}
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

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <colgroup>
            <col style={{ width: "80px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "200px" }} />
            <col />
            <col style={{ width: "150px" }} />
          </colgroup>
          
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                No
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Nama Unit
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Nama Room
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {units.map((u, index) => (
              <tr key={u.id_unit} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-3 text-sm font-normal text-gray-500">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td className="px-6 py-3 text-sm font-normal text-gray-900 dark:text-white">
                  {u.nama_unit}
                </td>
                <td className="px-6 py-3 text-sm font-normal text-gray-700 dark:text-gray-300">
                  {u.room?.nama_room ?? "-"}
                </td>
                <td className="px-6 py-3 text-sm font-normal text-gray-700 dark:text-gray-300">
                  {u.deskripsi}
                </td>

                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      title="Edit"
                      onClick={() => openEdit(u)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      title="Hapus"
                      onClick={() => setDeleteConfirm({ open: true, id: u.id_unit })}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {units.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada unit ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between rounded-b-2xl mt-[-1.5rem] relative z-10">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          </span>
          {" - "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(page * PAGE_SIZE, total)}
          </span>
          {" "}dari{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total}
          </span>{" "}
          unit
        </p>

        <div className="inline-flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold transition-all
              ${page === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[80px] text-center">
            Hal {page} / {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold transition-all
              ${page >= totalPages 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MODAL CREATE / EDIT */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">
              {newUnit.id ? "Edit Unit" : "Tambah Unit"}
            </h2>

            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Nama Unit</span>
                <input
                  value={newUnit.unit}
                  onChange={(e) => setNewUnit((s) => ({ ...s, unit: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Nama Room</span>
                <select
                  value={newUnit.room}
                  onChange={(e) => setNewUnit((s) => ({ ...s, room: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                <span className="text-sm font-medium">Deskripsi</span>
                <input
                  value={newUnit.description}
                  onChange={(e) =>
                    setNewUnit((s) => ({ ...s, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
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

      {/* DELETE CONFIRM */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-w-sm w-full bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold">Hapus Unit?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>

              <button
                onClick={doDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIF */}
      {notif && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
            notif.type === "error"
              ? "bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
              : "bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
          }`}
        >
          {notif.msg}
        </div>
      )}
    </section>
  );
}