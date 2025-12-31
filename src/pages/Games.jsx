import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const itemMax = 6;

export default function Games() {
  const [games, setGames] = useState([]);
  // const [units, setUnits] = useState([]); // HAPUS: Kita ga butuh data unit disini lagi

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // HAPUS unit dari state newGame
  const [newGame, setNewGame] = useState({ id: null, name: "" });

  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  // ===============================
  // FETCH DATA
  // ===============================
  // HAPUS useEffect fetchUnits, karena ga dipake

  useEffect(() => {
    setPage(1); 
  }, [query])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchGames();
    }, 150);
    return () => clearTimeout(timeout);
  }, [page, query]);

  const fetchGames = async () => {
    try {
      const response = await apiGet(`/games?page=${page}&limit=${itemMax}&search=${query}`);
      
      // --- PERBAIKAN CARA BACA DATA & META ---
      const data = response.data || []; // Ambil array games
      const meta = response.meta || {}; // Ambil info pagination
      
      setGames(data);
      setTotal(meta.total || 0); // Ambil total dari meta, default 0 biar ga NaN
      setPageCount(meta.totalPages || 1);
    } catch (err) {
      showNotif("Gagal memuat data game", "error");
    }
  };

  const paginatedGames = games;

  // ===============================
  // CREATE / UPDATE
  // ===============================
  const saveGame = async () => {
    const payload = {
      nama_game: newGame.name,
      // HAPUS id_unit, karena game master tidak punya unit
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
      setNewGame({ id: null, name: "" });
      fetchGames(); // Refresh table
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
              placeholder="Cari game..."
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={() => {
              setNewGame({ id: null, name: "" });
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
            <col style={{ width: "80px" }} />
            <col />
            <col style={{ width: "200px" }} />
            <col style={{ width: "150px" }} />
          </colgroup>
          
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                No
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Nama Game
              </th>
              {/* UBAH HEADER JADI LEBIH RELEVAN */}
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Ketersediaan
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {paginatedGames.map((game, index) => (
              <tr key={game.id_game} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3 text-sm font-normal text-gray-500">
                  {(page - 1) * itemMax + index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-gray-900 dark:text-white">
                  {game.nama_game}
                </td>
                
                {/* TAMPILAN JUMLAH UNIT */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${(game._count?.installed_on || 0) > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    Terinstall di {game._count?.installed_on || 0} Unit
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      title="Edit Nama"
                      onClick={() => {
                        setNewGame({
                          id: game.id_game,
                          name: game.nama_game,
                        });
                        setOpen(true);
                      }}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      title="Hapus Master Game"
                      onClick={() =>
                        setDeleteConfirm({ open: true, id: game.id_game })
                      }
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedGames.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada game ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between rounded-b-2xl mt-[-1rem] z-10 relative">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan daftar game{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
             {total === 0 ? 0 : (page - 1) * itemMax + 1}
          </span>
          {" - "}
          <span className="font-semibold text-gray-900 dark:text-white">
             {Math.min(page * itemMax, total)}
          </span>
          <span className="ml-2 text-xs text-gray-400">
             (Total {total} game)
          </span>
        </p>

        <div className="inline-flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold transition-all
              ${page === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[80px] text-center">
            Hal {page} / {pageCount || 1}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className={`flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold transition-all
              ${page === pageCount 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
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
              {newGame.id ? "Edit Master Game" : "Tambah Master Game"}
            </h2>

            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Nama Game</span>
                <input
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Contoh: FIFA 25"
                />
              </label>

              {/* HAPUS DROPDOWN UNIT DISINI. SETTING UNIT DILAKUKAN DI MENU UNIT */}
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
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
          <div className="max-w-sm w-full bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold">Hapus Game?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Menghapus game ini akan <b>menghapusnya dari semua unit</b> yang menginstallnya.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => setDeleteConfirm({ open: false, id: null })}
              >
                Batal
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
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