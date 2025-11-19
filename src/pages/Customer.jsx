import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

const DEFAULT_PAGE_SIZE = 10;

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState({ open: false, mode: "create" });
  const [notif, setNotif] = useState(null);
  const [formData, setFormData] = useState({
    id_customer: null,
    nama: "",
    no_hp: "",
    membership_id: "",
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null });
  const membershipFetchedRef = useRef(false);
  const lastFetchedPageRef = useRef(null);
  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  const membershipLookup = useMemo(() => {
    return memberships.reduce((acc, tier) => {
      acc[tier.id_membership] = tier;
      return acc;
    }, {});
  }, [memberships]);

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const matchName = customer.nama?.toLowerCase().includes(query.toLowerCase());
      const tierName = membershipLookup[customer.membership_id]?.nama_tier.toLowerCase() ?? "";
      const matchTier = tierName.includes(query.toLowerCase());
      return matchName || matchTier;
    });
  }, [customers, membershipLookup, query]);

  const fetchCustomer = async (pageParam = 1, { force = false } = {}) => {
    if (!force && lastFetchedPageRef.current === pageParam) {
      return;
    }
    lastFetchedPageRef.current = pageParam;
    setLoadingCustomers(true);
    try {
      const response = await apiGet(`/customers?page=${pageParam}`);
      const dataCust = response.data ?? [];
      const pagination = response.pagination ?? {};
      setCustomers(dataCust);
      setPageCount(Math.max(1, pagination.totalPages ?? 1));
      const resolvedPageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
      setPageSize(resolvedPageSize);
      setTotalItems(pagination.totalItems ?? dataCust.length);
    } catch (error) {
      lastFetchedPageRef.current = null;
      console.error("Failed to fetch customers", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchMemberships = async () => {
    if (loadingMemberships) return;
    setLoadingMemberships(true);
    try {
      const data = await apiGet("/membership");
      setMemberships(data);
    } catch (error) {
      console.error("Failed to fetch membership list", error);
    } finally {
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    if (membershipFetchedRef.current) return;
    membershipFetchedRef.current = true;
    fetchMemberships();
  }, []);

  useEffect(() => {
    fetchCustomer(page);
  }, [page]);

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPage((prev) => Math.min(pageCount, prev + 1));
  };

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
    setFormData({
      id_customer: customer.id_customer,
      nama: customer.nama ?? "",
      no_hp: customer.no_hp ?? "",
      membership_id: customer.membership_id ?? "",
    });
  };

  const buildPayload = (payload) => ({
    nama: payload.nama,
    membership_id: Number(payload.membership_id),
    no_hp: payload.no_hp?.trim() ? payload.no_hp.trim() : null,
  });

  const handleCreateCustomer = async (payload) => {
    await apiPost("/customers", buildPayload(payload));
    await fetchCustomer(1, { force: true });
    setPage(1);
    showNotif("Customer berhasil ditambahkan");
  };

  const handleUpdateCustomer = async (id, payload) => {
    await apiPut(`/customers/${id}`, buildPayload(payload));
    showNotif("Data customer berhasil diperbarui");
    await fetchCustomer(page, { force: true });
  };

  const handleDeleteCustomer = async (id) => {
    await apiDelete(`/customers/${id}`);
    showNotif("Customer berhasil dihapus");
    const isLastItemOnPage = customers.length === 1 && page > 1;
    if (isLastItemOnPage) {
      const prevPage = Math.max(1, page - 1);
      await fetchCustomer(prevPage, { force: true });
      setPage(prevPage);
      return;
    }
    await fetchCustomer(page, { force: true });
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.membership_id) return;
    try {
      if (modalState.mode === "create") {
        await handleCreateCustomer(formData);
      } else if (modalState.mode === "edit") {
        await handleUpdateCustomer(formData.id_customer, formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to submit customer form", error);
    }
  };

  const askDeleteCustomer = (customer) => {
    setConfirmDelete({ open: true, target: customer });
  };

  const confirmRemoveCustomer = async () => {
    if (!confirmDelete.target) return;
    try {
      await handleDeleteCustomer(confirmDelete.target.id_customer);
    } catch (error) {
      console.error("Failed to delete customer", error);
    } finally {
      setConfirmDelete({ open: false, target: null });
    }
  };

  const closeConfirmModal = () => setConfirmDelete({ open: false, target: null });

  return (<>
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
            {loadingCustomers ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sedang memuat data customer...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((customer, index) => {
                const membership = membershipLookup[customer.membership_id];
                return (
                  <tr key={customer.id_customer}>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {(page - 1) * pageSize + index + 1}
                    </td>
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
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada customer
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Halaman{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{page}</span> dari{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{pageCount}</span> • Total{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{totalItems}</span> customer
        </p>

        <div className="inline-flex items-center gap-1 self-end md:self-auto">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page === 1}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-300">
            Halaman {page} / {pageCount}
          </span>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={page === pageCount}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
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
                  disabled={loadingMemberships && memberships.length === 0}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">
                    {loadingMemberships && memberships.length === 0
                      ? "Memuat membership..."
                      : "-- Pilih Tier --"}
                  </option>
                  {!loadingMemberships &&
                    memberships.map((tier) => (
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
              <h2 className="text-lg font-semibold">Hapus Customer?</h2>
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
