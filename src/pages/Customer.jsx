import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { apiGet } from "../lib/api";

const MEMBERSHIP_LOOKUP = {
  1: { id_membership: 1, nama_tier: "Bronze", diskon_persen: 5 },
  2: { id_membership: 2, nama_tier: "Silver", diskon_persen: 10 },
  3: { id_membership: 3, nama_tier: "Gold", diskon_persen: 15 },
};

const initialCustomers = [
  // { id_customer: 1, nama: "Budi Setiawan", no_hp: "081234567890", membership_id: 1 },
  // { id_customer: 2, nama: "Sinta Wijaya", no_hp: "082198873210", membership_id: 2 },
  // { id_customer: 3, nama: "Rizky Saputra", no_hp: "085278331120", membership_id: 3 },
];

export default function Customer() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState({ open: false, mode: "create" });
  const [formData, setFormData] = useState({
    id_customer: null,
    nama: "",
    no_hp: "",
    membership_id: "",
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null });

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const matchName = customer.nama?.toLowerCase().includes(query.toLowerCase());
      const tierName =
        MEMBERSHIP_LOOKUP[customer.membership_id]?.nama_tier.toLowerCase() ?? "";
      const matchTier = tierName.includes(query.toLowerCase());
      return matchName || matchTier;
    });
  }, [customers, query]);

  const fetchCustomer = async () => {
    const data = await apiGet('/customers');
    console.log("Fetched customers:", data);
  }

  useEffect(() => {
    fetchCustomer();
  }, []);

  const closeModal = () => {
    setModalState({ open: false, mode: "create" });
    setFormData({ id_customer: null, nama: "", no_hp: "", membership_id: "" });
  };

  const openCreateModal = () => {
    setModalState({ open: true, mode: "create" });
    setFormData({ id_customer: null, nama: "", no_hp: "", membership_id: "" });
  };

  const openEditModal = (customer) => {
    setModalState({ open: true, mode: "edit" });
    setFormData({ ...customer });
  };

  const handleCreateCustomer = (payload) => {
    console.log("TODO: POST /customers payload", payload);
  };

  const handleUpdateCustomer = (id, payload) => {
    console.log("TODO: PUT /customers/" + id, payload);
  };

  const handleDeleteCustomer = (id) => {
    console.log("TODO: DELETE /customers/" + id);
  };

  const handleSubmit = () => {
    if (!formData.nama || !formData.membership_id) return;

    if (modalState.mode === "create") {
      const newCustomer = {
        ...formData,
        id_customer: Date.now(),
        membership_id: Number(formData.membership_id),
      };
      handleCreateCustomer(newCustomer);
      setCustomers((prev) => [...prev, newCustomer]);
    } else if (modalState.mode === "edit") {
      handleUpdateCustomer(formData.id_customer, formData);
      setCustomers((prev) =>
        prev.map((item) => (item.id_customer === formData.id_customer ? formData : item)),
      );
    }
    closeModal();
  };

  const removeCustomer = (id) => {
    handleDeleteCustomer(id);
    setCustomers((prev) => prev.filter((item) => item.id_customer !== id));
  };

  const askDeleteCustomer = (customer) => {
    setConfirmDelete({ open: true, target: customer });
  };

  const confirmRemoveCustomer = () => {
    if (!confirmDelete.target) return;
    removeCustomer(confirmDelete.target.id_customer);
    setConfirmDelete({ open: false, target: null });
  };

  const closeConfirmModal = () => setConfirmDelete({ open: false, target: null });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Data Customer</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama / tier..."
              className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Customer
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
                Nama
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nomor HP
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Membership
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {filtered.map((customer, index) => {
              const membership = MEMBERSHIP_LOOKUP[customer.membership_id];
              return (
                <tr key={customer.id_customer}>
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{customer.nama}</td>
                  <td className="px-4 py-3 text-sm">{customer.no_hp || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium">{membership?.nama_tier ?? "-"}</p>
                    {membership?.diskon_persen != null && (
                      <span className="text-xs text-gray-500">
                        Diskon {membership.diskon_persen}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => askDeleteCustomer(customer)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada customer
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalState.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {modalState.mode === "create" ? "Tambah Customer" : "Edit Customer"}
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
                <span className="text-sm">Nama</span>
                <input
                  value={formData.nama}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Nama customer"
                />
              </label>
              <label className="block">
                <span className="text-sm">Nomor HP</span>
                <input
                  value={formData.no_hp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, no_hp: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="08xxxxxxxxx"
                />
              </label>
              <label className="block">
                <span className="text-sm">Membership</span>
                <select
                  value={formData.membership_id ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      membership_id: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Tier --</option>
                  {Object.values(MEMBERSHIP_LOOKUP).map((tier) => (
                    <option key={tier.id_membership} value={tier.id_membership}>
                      {tier.nama_tier}
                    </option>
                  ))}
                </select>
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
              <h2 className="text-lg font-semibold text-red-600">Hapus Customer</h2>
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
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold">{confirmDelete.target?.nama}</span>? Tindakan ini
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
                onClick={confirmRemoveCustomer}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
