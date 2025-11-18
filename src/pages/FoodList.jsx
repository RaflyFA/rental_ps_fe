import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Search, ChevronRight, ChevronLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const PAGE_SIZE = 5;

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
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    target: null,
  });
  useEffect(() => {
    let alive = true;
    async function fetchFoods() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search: query.trim(),
        });
        const res = await fetch(`${API_BASE}/api/foods?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch foods");
        const { data, meta } = await res.json();
        console.log("foods response:", { data, meta });
        if (!alive) return;
        setFoods(data || []);
        setTotal(meta?.total ?? (data ? data.length : 0));
        setTotalPages(meta?.totalPages ?? 1);
      } catch (err) {
        if (!alive) return;
        console.error(err);
        const fallback = [
          { id_food: 1, nama_makanan: "Mie Goreng Instan", harga: 12000 },
          { id_food: 2, nama_makanan: "Mie Rebus Instan", harga: 12000 },
        ];
        setFoods(fallback);
        setTotal(fallback.length);
        setTotalPages(1);
      }
    }
    fetchFoods();
    return () => {
      alive = false;
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
        const res = await fetch(
          `${API_BASE}/api/foods/${editingFood.id_food}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("update failed");
        const updated = await res.json();
        setFoods((prev) =>
          prev.map((f) => (f.id_food === updated.id_food ? updated : f))
        );
      } else {
        const res = await fetch(`${API_BASE}/api/foods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("create failed");
        await res.json(); // ga terlalu dipakai di sini
        setRefreshToken((x) => x + 1);
      }
      setOpenForm(false);
      setEditingFood(null);
      setForm({ nama_makanan: "", harga: "" });
      setFormError("");
    } catch (err) {
      console.error(err);
      setFormError(
        editingFood
          ? "Gagal menyimpan perubahan. Pastikan backend PUT /api/foods/:id sudah siap."
          : "Gagal membuat menu. Pastikan backend POST /api/foods sudah siap."
      );
    }
  }
  async function removeFood(id) {
    try {
      const res = await fetch(`${API_BASE}/api/foods/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setFoods((prev) => prev.filter((f) => f.id_food !== id));
      setTotal((t) => Math.max(0, t - 1));
      setRefreshToken((x) => x + 1);
    } catch (err) {
      console.error(err);
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
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                ID
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Harga
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {foods.map((f) => (
              <tr key={f.id_food}>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {f.id_food}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {f.nama_makanan}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(Number(f.harga))}
                </td>
                <td className="px-4 py-3 text-right">
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
      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan{" "}
          <span className="font-semibold">{from}</span>–
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {to}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {total}
          </span>{" "}
          menu
        </p>
        <div className="inline-flex items-center gap-1 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Halaman {page} / {safeTotalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.min(safeTotalPages, p + 1))
            }
            disabled={page === safeTotalPages}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
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
    </section>
  );
}