import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

export default function Membership() {
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState({ open: false, mode: "create" });
  const [notif, setNotif] = useState(null);
  const [formData, setFormData] = useState({
    id_membership: null,
    nama_tier: "",
    diskon_persen: "",
    poin_bonus: "",
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null });
  const hasFetchedRef = useRef(false);
  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };
  const filtered = useMemo(() => {
    return memberships.filter((item) => item.nama_tier.toLowerCase().includes(query.toLowerCase()));
  }, [memberships, query]);

  const fetchMemberships = async () => {
    if (loadingMemberships) return;
    setLoadingMemberships(true);
    try {
      const data = await apiGet("/membership");
      setMemberships(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch membership list", error);
    } finally {
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchMemberships();
  }, []);

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setFormData({ id_membership: null, nama_tier: "", diskon_persen: "", poin_bonus: "" });
  };

  const openCreateModal = () => {
    setModalState({ open: true, mode: "create" });
    setFormData({ id_membership: null, nama_tier: "", diskon_persen: "", poin_bonus: "" });
  };

  const openEditModal = (membership) => {
    setModalState({ open: true, mode: "edit" });
    setFormData({
      ...membership,
      diskon_persen: membership.diskon_persen?.toString() ?? "",
      poin_bonus: membership.poin_bonus?.toString() ?? "",
    });
  };

  const toNullableNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const buildPayload = (payload) => ({
    nama_tier: payload.nama_tier,
    diskon_persen: toNullableNumber(payload.diskon_persen),
    poin_bonus: toNullableNumber(payload.poin_bonus),
  });

  const handleCreateMembership = async (payload) => {
    await apiPost("/membership", buildPayload(payload));
    showNotif("Tier membership berhasil ditambahkan");
    await fetchMemberships();
  };

  const handleUpdateMembership = async (id, payload) => {
    await apiPut(`/membership/${id}`, buildPayload(payload));
    showNotif("Tier membership berhasil diperbarui");
    await fetchMemberships();
  };

  const handleDeleteMembership = async (id) => {
    await apiDelete(`/membership/${id}`);
    showNotif("Tier membership berhasil dihapus");
    await fetchMemberships();
  };

  const handleSubmit = async () => {
    if (!formData.nama_tier) return;
    try {
      if (modalState.mode === "create") {
        await handleCreateMembership(formData);
      } else if (modalState.mode === "edit") {
        await handleUpdateMembership(formData.id_membership, formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to submit membership form", error);
    }
  };

  const askDeleteTier = (membership) => {
    setConfirmDelete({ open: true, target: membership });
  };

  const confirmRemoveTier = async () => {
    if (!confirmDelete.target) return;
    try {
      await handleDeleteMembership(confirmDelete.target.id_membership);
    } catch (error) {
      console.error("Failed to delete membership", error);
    } finally {
      setConfirmDelete({ open: false, target: null });
    }
  };

  const closeConfirmModal = () => setConfirmDelete({ open: false, target: null });

  return (
    <>
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tier Membership</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari tier..."
              className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Tier
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
                Nama Tier
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Diskon (%)
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Poin Bonus
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {loadingMemberships ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sedang memuat tier membership...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item, index) => (
                <tr key={item.id_membership}>
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.nama_tier}</td>
                  <td className="px-4 py-3 text-sm">{item.diskon_persen ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.poin_bonus ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => askDeleteTier(item)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada tier
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalState.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {modalState.mode === "create" ? "Tambah Tier" : "Edit Tier"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <label className="block">
                <span className="text-sm">Nama Tier</span>
                <input
                  value={formData.nama_tier}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama_tier: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Gold, Silver, dst"
                />
              </label>
              <label className="block">
                <span className="text-sm">Diskon (%)</span>
                <input
                  type="number"
                  value={formData.diskon_persen}
                  onChange={(e) => setFormData((prev) => ({ ...prev, diskon_persen: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm">Poin Bonus</span>
                <input
                  type="number"
                  value={formData.poin_bonus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, poin_bonus: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="0"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
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
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Hapus Tier?</h2>
              <button
                type="button"
                onClick={closeConfirmModal}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus tier{" "}
              <span className="font-semibold">{confirmDelete.target?.nama_tier}</span>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRemoveTier}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
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
    </>
  );
}
