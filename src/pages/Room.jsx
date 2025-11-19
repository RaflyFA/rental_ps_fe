import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api.js";

const itemMax = 5;

export default function Room() {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [editRoom, setEditRoom] = useState(null);

  const [form, setForm] = useState({ nama_room: "", harga: "", tipe_room: "", kapasitas: "" });
  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  const fetchRooms = async () => {
    try {
      const response = await apiGet("/room/with-price");
      setRooms(response.data);
    } catch (err) {
      showNotif(err.message || "Gagal memuat data ruangan", "error");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filtered = useMemo(
    () => rooms.filter((r) => r.nama_room.toLowerCase().includes(query.toLowerCase())),
    [rooms, query]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemMax));
  const currentPage = Math.min(page, pageCount);

  const startIndex = (currentPage - 1) * itemMax;
  const paginatedRooms = filtered.slice(startIndex, startIndex + itemMax);

  const from = filtered.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + itemMax, filtered.length);
  
  const saveRoom = async (e) => {
    e.preventDefault();
    const payload = {
    nama_room: form.nama_room,
    tipe_room: form.tipe_room,
    kapasitas: Number(form.kapasitas),
    harga: Number(form.harga),
      };

    try {
      if (editRoom) {
        // untuk Update
        await apiPut(`/room/${editRoom.id_room}`, payload);
        fetchRooms();
        showNotif("Ruangan berhasil diubah");
      } else {
        // untuk Create
        const created = await apiPost("/room", payload);
        setRooms((prev) => [created, ...prev]);
        showNotif("Ruangan berhasil ditambahkan");
      }

      // Reset form
      setForm({ nama_room: "", harga: "", tipe_room: "", kapasitas: "" });
      setEditRoom(null);
      setOpen(false);
    } catch (err) {
      showNotif(err.message || "Gagal menyimpan data", "error");
    }
  };

  const doDelete = async () => {
    try {
      await apiDelete(`/room/${deleteConfirm.id}`);
      setRooms((prev) => prev.filter((r) => r.id_room !== deleteConfirm.id));
      showNotif("Ruangan berhasil dihapus");
      setDeleteConfirm({ open: false, id: null });
    } catch (err) {
      showNotif(err.message || "Gagal menghapus ruangan", "error");
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
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

          <button
            onClick={() => {
              setForm({ nama_room: "", harga: "", tipe_room: "", kapasitas: "" });
              setEditRoom(null);
              setOpen(true);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Ruangan Baru
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <colgroup>
            <col style={{ width: "200px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {/* <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">ID</th> */}
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Nama Ruangan</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Tipe</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Kapasitas</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Harga per Jam</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {paginatedRooms.map((room) => (
              <tr key={room.id_room}>
                {/* <td className="px-4 py-3 text-sm text-gray-500">{room.id_room}</td> */}
                <td className="px-4 py-3 text-sm font-medium">{room.nama_room}</td>
                <td className="px-4 py-3 text-sm font-medium">{room.tipe_room}</td>
                <td className="px-4 py-3 text-sm font-medium">{room.kapasitas}</td>
                <td className="px-4 py-3 text-sm">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(Number(room.price_list?.[0]?.harga_per_jam))}
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => {
                      setForm({
                        nama_room: room.nama_room,
                        tipe_room: room.tipe_room,
                        kapasitas: room.kapasitas,
                        harga: room.price_list?.[0]?.harga_per_jam || "",
                      });
                      setEditRoom(room);
                      setOpen(true);
                    }}
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: room.id_room })}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  Tidak ada ruangan ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREATE / EDIT */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">{editRoom ? "Edit Ruangan" : "Tambah Ruangan"}</h2>

            <form className="mt-4 space-y-4" onSubmit={saveRoom}>
              <label className="block">
                <span className="text-sm">Nama Ruangan</span>
                <input
                  required
                  value={form.nama_room}
                  onChange={(e) => setForm((s) => ({ ...s, nama_room: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm">Tipe Room</span>
                <select
                  required
                  value={form.tipe_room}
                  onChange={(e) => setForm((s) => ({ ...s, tipe_room: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="" disabled>Pilih tipe room</option>
                  <option value="reguler">Reguler</option>
                  <option value="vip">VIP</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm">Kapasitas</span>
                <input
                  required
                  value={form.kapasitas}
                  onChange={(e) => setForm((s) => ({ ...s, kapasitas: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm">Harga / Jam (Rp)</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.harga}
                  onChange={(e) => setForm((s) => ({ ...s, harga: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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

      {/* DELETE CONFIRM */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-w-sm w-full bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Hapus Ruangan?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => setDeleteConfirm({ open: false, id: null })}
              >
                Batal
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={doDelete}
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
          className={`
            fixed bottom-6 right-6 z-50
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

      {/* PAGINATION FOOTER */}
      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan <span className="font-semibold">{from}</span>–<span className="font-semibold text-gray-700 dark:text-gray-200">{to}</span> dari{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span> ruangan
        </p>

        <div className="inline-flex items-center gap-1 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
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
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
