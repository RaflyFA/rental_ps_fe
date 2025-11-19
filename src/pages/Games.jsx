import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const itemMax = 5;

export default function Games() {
  const [games, setGames] = useState([]);
  const [units, setUnits] = useState([]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [newGame, setNewGame] = useState({ id: null, name: "", unit: "" });

  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [page]);

  const fetchGames = async () => {
    try {
      const data = await apiGet(`/games?page=${page}&limit=${itemMax}`);

      setGames(data.data);
      setTotal(data.total);
      setPageCount(data.totalPages);
    } catch (err) {
      showNotif("Gagal memuat data game", "error");
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await apiGet("/unit");
      setUnits(data);
    } catch (err) {
      showNotif("Gagal memuat data unit", "error");
    }
  };

  // ===============================
  // FILTER SEARCH
  // ===============================
  const filtered = useMemo(() => {
    return games.filter((g) =>
      g.nama_game.toLowerCase().includes(query.toLowerCase())
    );
  }, [games, query]);

  const paginatedGames = filtered; // BE pagination sudah handle, FE hanya filter

  // ===============================
  // CREATE / UPDATE
  // ===============================
  const saveGame = async () => {
    const payload = {
      nama_game: newGame.name,
      id_unit: Number(newGame.unit)
    };

    const isEdit = newGame.id !== null;

    try {
      if (isEdit) {
        await apiPut(`/games/${newGame.id}`, payload);
        showNotif("Game berhasil diubah");
      } else {
        await apiPost("/games", payload);
        showNotif("Game berhasil ditambahkan");
      }

      setOpen(false);
      setNewGame({ id: null, name: "", unit: "" });
      fetchGames();
    } catch {
      showNotif("Gagal menyimpan data", "error");
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const doDelete = async () => {
    try {
      await apiDelete(`/games/${deleteConfirm.id}`);
      showNotif("Game berhasil dihapus");
      fetchGames();
    } catch {
      showNotif("Gagal menghapus data", "error");
    }
    setDeleteConfirm({ open: false, id: null });
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">List Game</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari game…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={() => {
              setNewGame({ id: null, name: "", unit: "" });
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Game
          </button>
        </div>
      </div>

      {/* TABLE */}
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
                No
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama Game
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                Nama Unit
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {paginatedGames.map((game, index) => (
              <tr key={game.id_game}>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {(page - 1) * itemMax + index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{game.nama_game}</td>
                <td className="px-4 py-3 text-sm">{game.unit?.nama_unit ?? "-"}</td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => {
                      setNewGame({
                        id: game.id_game,
                        name: game.nama_game,
                        unit: game.id_unit
                      });
                      setOpen(true);
                    }}
                    className="mr-2 rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      setDeleteConfirm({ open: true, id: game.id_game })
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedGames.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Tidak ada game ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500 dark:text-gray-400">
          Halaman{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {page}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {pageCount}
          </span>
        </p>

        <div className="inline-flex items-center gap-1 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-300">
            Halaman {page} / {pageCount}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center gap-2"
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
              {newGame.id ? "Edit Game" : "Tambah Game"}
            </h2>

            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm">Nama Game</span>
                <input
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm">Nama Unit</span>
                <select
                  value={newGame.unit}
                  onChange={(e) =>
                    setNewGame((s) => ({ ...s, unit: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map((u) => (
                    <option key={u.id_unit} value={u.id_unit}>
                      {u.nama_unit}
                    </option>
                  ))}
                </select>
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
                  type="button"
                  onClick={saveGame}
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
            <h3 className="text-lg font-semibold">Hapus Game?</h3>
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
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
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
