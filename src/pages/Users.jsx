import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_URL || "";

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
  const [users, setUsers] = useState([
    { id: 1, name: "Admin Owner", role: "owner" },
    { id: 2, name: "Budi Staff", role: "staff" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null => create, object => edit
  const [form, setForm] = useState({ name: "", role: "staff" });
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);

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
  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, name: form.name.trim(), role: form.role }
            : u
        )
      );
    } else {
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [
        ...prev,
        { id: nextId, name: form.name.trim(), role: form.role },
      ]);
    }
    setShowModal(false);
  }
  function confirmDelete(user) {
    setToDelete(user);
    setShowDelete(true);
  }
  function doDelete() {
    if (!toDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
    setToDelete(null);
    setShowDelete(false);
  }
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
          search: query,
        });
	  
        const res = await fetch(`${API_BASE}/api/users?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch users");
	  
        const { data } = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error(err);
      }
    }
  
    fetchUsers();
  }, [page, query]);
  const filtered = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [users, query]);

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari user…"
              className="w-56 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah User
          </button>
        </div>
      </div>
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
            {filtered.map((u, idx) => (
              <tr
                key={u.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {u.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {u.role === "owner" ? "Owner" : "Staff Pegawai"}
                </td>
                <td className="space-x-2 px-4 py-3 text-center">
                  <button
                    title="Edit (opsional)"
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => openEdit(u)}
                    type="button"
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
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Belum ada user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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