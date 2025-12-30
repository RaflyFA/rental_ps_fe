import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api"

const PAGE_SIZE = 6;

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState({ nama_makanan: "", harga: "" });
  const [formError, setFormError] = useState("");
  const [notif, setNotif] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    target: null,
  });
  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);};
  useEffect(() => {
    let alive = true;
    async function fetchFoods() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search: query.trim(),
        });
        const { data, meta } = await apiGet(`/foods?${params.toString()}`);
        console.log("foods response:", { data, meta });
        if (!alive) return;
        setFoods(data || []);
        setTotal(meta?.total ?? (data ? data.length : 0));
        setTotalPages(meta?.totalPages ?? 1);
      } catch (err) {
        if (!alive) return;
        showNotif("Gagal koneksi ke Database");
        const fallback = [
          { id_food: 1, nama_makanan: "Mie Goreng Instan", harga: 12000 },
          { id_food: 2, nama_makanan: "Mie Rebus Instan", harga: 12000 },
        ];
        setFoods(fallback);
        setTotal(fallback.length);
        setTotalPages(1);
      }
    }
    const timer = setTimeout(() => {
      fetchFoods();
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [page, query, refreshToken]);
  const safeTotalPages = totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);
  const openCreateModal = () => {
    setEditingFood(null);
    setForm({ nama_makanan: "", harga: "" });
    setFormError("");
    setOpenForm(true);
  };
  const openEditModal = (food) => {
    setEditingFood(food);
    setForm({
      nama_makanan: food.nama_makanan,
      harga: String(food.harga),
    });
    setFormError("");
    setOpenForm(true);
  };
  async function handleSubmitForm(e) {
    e.preventDefault();
    const payload = {
      nama_makanan: form.nama_makanan,
      harga: Number(form.harga),
    };
    try {
      if (editingFood) {
        const updated = await apiPut(`/foods/${editingFood.id_food}`, payload);
        setFoods((prev) =>
          prev.map((f) => (f.id_food === updated.id_food ? updated : f))
        );
        showNotif("Menu berhasil diperbarui!");
      } else {
        await apiPost("/foods", payload);
        setRefreshToken((x) => x + 1);
        showNotif("Menu berhasil ditambahkan!");
      }
      setOpenForm(false);
      setEditingFood(null);
      setForm({ nama_makanan: "", harga: "" });
      setFormError("");
    } catch (err) {
      console.error(err);
      setFormError(
        editingFood
          ? "Gagal menyimpan perubahan. Pastikan backend PUT /foods/:id sudah siap."
          : "Gagal membuat menu. Pastikan backend POST /foods sudah siap."
      );
      showNotif("Terjadi kesalahan saat menyimpan.", "error");
    }
  }
  async function removeFood(id) {
    try {
      await apiDelete(`/foods/${id}`);
      setFoods((prev) => prev.filter((f) => f.id_food !== id));
      setTotal((t) => Math.max(0, t - 1));
      setRefreshToken((x) => x + 1);
      showNotif("Menu berhasil dihapus!");
    } catch (err) {
      console.error(err);
      showNotif("Gagal menghapus menu.", "error");
    }
  }
  const askDeleteFood = (food) => {
    setConfirmDelete({ open: true, target: food });
  };
  const handleConfirmDelete = async () => {
    if (!confirmDelete.target) return;
    await removeFood(confirmDelete.target.id_food);
    setConfirmDelete({ open: false, target: null });
  };
  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, target: null });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Food List</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {setPage(1); setQuery(e.target.value)}}
              placeholder="Cari menu…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Menu Baru
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <colgroup>
            <col style={{ width: "64px" }} />
            <col />
            <col style={{ width: "200px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                ID
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Nama
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Harga
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {foods.map((f) => (
              <tr key={f.id_food}>
                <td className="px-4 py-4 font-normal text-sm text-gray-500">
                  {f.id_food}
                </td>
                <td className="px-4 py-4 text-sm font-normal">
                  {f.nama_makanan}
                </td>
                <td className="px-4 py-4 text-sm">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(Number(f.harga))}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    title="Edit"
                    onClick={() => openEditModal(f)}
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => askDeleteFood(f)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {foods.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Tidak ada data menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* --- PAGINATION FOOD LIST (Reference Style) --- */}
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between rounded-b-2xl mt-[-1rem] z-10 relative">
        
        {/* KIRI: Info Halaman & Total Data */}
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan Menu{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          </span>
          {" - "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(page * PAGE_SIZE, total)}
          </span>
          <span className="ml-2 text-xs text-gray-400">
             (Total {total} Menu)
          </span>
        </p>

        {/* KANAN: Tombol Navigasi */}
        <div className="inline-flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`rounded-xl px-3 py-1 text-sm font-semibold flex items-center gap-2 transition-all
              ${page === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70 dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
            className={`rounded-xl px-3 py-1 text-sm font-semibold flex items-center gap-2 transition-all
              ${page >= totalPages 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70 dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">
              {editingFood ? "Edit Menu" : "Tambah Menu"}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitForm}>
              <label className="block">
                <span className="text-sm">Nama makanan</span>
                <input
                  required
                  value={form.nama_makanan}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, nama_makanan: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
              <label className="block">
                <span className="text-sm">Harga (Rupiah)</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.harga}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, harga: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenForm(false);
                    setEditingFood(null);
                    setFormError("");
                  }}
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
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Hapus Menu</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Yakin ingin menghapus menu{" "}
              <span className="font-semibold">
                {confirmDelete.target?.nama_makanan}
              </span>
              ?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {notif && (
      <div
          className={`fixed bottom-6 right-6 z-[999] rounded-xl px-4 py-3 text-sm shadow-lg
            ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {notif.msg}
        </div>
      )}
    </section>
  );
}