import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { apiGet, apiPut } from "../lib/api";

export default function UserProfile() {
  const currentUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState(currentUser ?? null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    setForm({ name: currentUser.name || "", email: currentUser.email || "", password: "" });
    setProfile(currentUser);
  }, [currentUser]);

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      // update own profile
      const updated = await apiPut(`/users/${profile.id}`, payload);
      setProfile(updated);
      setMessage("Profil berhasil disimpan");
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "Gagal menyimpan profil");
    } finally {
      setLoading(false);
      setForm((f) => ({ ...f, password: "" }));
    }
  }

  if (!profile) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Akun</h1>
        <p className="text-sm text-gray-500">Akun tidak tersedia.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Akun Saya</h1>

      <form onSubmit={save} className="max-w-md space-y-3">
        {message && <div className="text-sm text-green-600">{message}</div>}

        <label className="block text-sm text-gray-700">Nama</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md border px-3 py-2"
        />

        <label className="block text-sm text-gray-700">Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-md border px-3 py-2"
        />

        <label className="block text-sm text-gray-700">Password (kosongkan jika tidak diubah)</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full rounded-md border px-3 py-2"
        />

        <div className="flex justify-end">
          <button disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-white">
            Simpan
          </button>
        </div>
      </form>
    </section>
  );
}
