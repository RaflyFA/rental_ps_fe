import React, { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

function Modal({ visible, title, children, onClose }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            className="text-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "staff" });

  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search: query,
        });

        const res = await apiGet(`/users?${params.toString()}`);
        setUsers(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        } else {
          setMeta((prev) => ({
            ...prev,
            page,
            total: res.data ? res.data.length : 0,
            totalPages: 1,
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err?.message || "Gagal memuat user");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [page, query]);
  function openCreate() {
    setEditing(null);
    setForm({ name: "", role: "staff" });
    setShowModal(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, role: user.role });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      role: form.role,
    };

    try {
      setLoading(true);
      setError("");

      if (editing) {
        const updated = await apiPut(`/users/${editing.id}`, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
      } else {
        const created = await apiPost("/users", payload);
        setUsers((prev) => [...prev, created]);
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal menyimpan user");
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(user) {
    setToDelete(user);
    setShowDelete(true);
  }

  async function doDelete() {
    if (!toDelete) return;

    try {
      setLoading(true);
      setError("");

      await apiDelete(`/users/${toDelete.id}`);

      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal menghapus user");
    } finally {
      setToDelete(null);
      setShowDelete(false);
      setLoading(false);
    }
  }

  const canPrev = meta.page > 1;
  const canNext = meta.page < meta.totalPages;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Daftar User
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Cari user…"
              className="w-56 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>
          <button
            onClick={openCreate}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah User
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                No
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Nama
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Jabatan
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Memuat data user...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Belum ada user.
                </td>
              </tr>
            )}

            {users.map((u, idx) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="px-4 py-3 text-sm text-gray-500">
                  {(meta.page - 1) * meta.limit + idx + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {u.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {u.role === "owner" ? "Owner" : "Staff Pegawai"}
                </td>
                <td className="space-x-2 px-4 py-3 text-center">
                  <button
                    title="Edit"
                    type="button"
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(u)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <div>
          Halaman {meta.page} dari {meta.totalPages} • Total {meta.total} user
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => p - 1)}
            className={`rounded-md border px-3 py-1 ${
              canPrev
                ? "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                : "cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600"
            }`}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
            className={`rounded-md border px-3 py-1 ${
              canNext
                ? "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                : "cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
      <Modal
        visible={showModal}
        title={editing ? "Edit User" : "Tambah User"}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSave}>
          <label className="mt-2 block text-sm text-gray-700 dark:text-gray-200">
            Nama
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <label className="mt-3 block text-sm text-gray-700 dark:text-gray-200">
            Jabatan
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="owner">Owner</option>
            <option value="staff">Staff Pegawai</option>
          </select>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setShowModal(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        visible={showDelete}
        title="Konfirmasi Hapus"
        onClose={() => setShowDelete(false)}
      >
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Hapus user &quot;{toDelete?.name}&quot;?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => setShowDelete(false)}
            type="button"
          >
            Batal
          </button>
          <button
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 dark:bg-red-500 dark:hover:bg-red-600"
            onClick={doDelete}
            type="button"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </section>
  );
}