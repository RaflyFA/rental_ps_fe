import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, Gamepad2, X } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const PAGE_SIZE = 6;

export default function Unit() {
  const [units, setUnits] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedUnitForGames, setSelectedUnitForGames] = useState(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [newUnit, setNewUnit] = useState({
    id: null,
    unit: "",
    room: "",
    description: "",
  });

  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    let alive = true;

    async function fetchUnits() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search: query.trim(),
        });

        const response = await apiGet(`/unit?${params.toString()}`);
        
        if (!alive) return;

        const data = response.data || response; 
        const meta = response.meta || {};

        setUnits(Array.isArray(data) ? data : []);
        setTotal(meta.total || (Array.isArray(data) ? data.length : 0));
        setTotalPages(meta.totalPages || 1);

      } catch (err) {
        if (!alive) return;
        showNotif("Gagal memuat data unit", "error");
      }
    }

    const timer = setTimeout(() => {
      fetchUnits();
    }, 150); 

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [page, query, selectedUnitForGames]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const fetchRooms = async () => {
    try {
      const data = await apiGet("/room?all=true");
      setRooms(data);
    } catch (err) {
      showNotif("Gagal memuat data room", "error");
    }
  };

  const saveUnit = async () => {
    const payload = {
      nama_unit: newUnit.unit,
      id_room: Number(newUnit.room),
      deskripsi: newUnit.description,
    };

    const isEdit = newUnit.id !== null;

    try {
      if (isEdit) {
        await apiPut(`/unit/${newUnit.id}`, payload);
        showNotif("Unit berhasil diubah");
      } else {
        await apiPost("/unit", payload);
        showNotif("Unit berhasil ditambahkan");
      }

      setOpen(false);
      setNewUnit({ id: null, unit: "", room: "", description: "" });

    } catch (err) {
      showNotif("Gagal menyimpan unit", "error");
    }
  };

  const doDelete = async () => {
    try {
      await apiDelete(`/unit/${deleteConfirm.id}`);
      showNotif("Unit berhasil dihapus");
      setPage(1); 
    } catch (err) {
      showNotif("Gagal menghapus unit", "error");
    }
    setDeleteConfirm({ open: false, id: null });
  };

  const openEdit = (u) => {
    setNewUnit({
      id: u.id_unit,
      unit: u.nama_unit,
      room: u.id_room,
      description: u.deskripsi ?? "",
    });
    setOpen(true);
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">List Unit</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit..."
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              setNewUnit({ id: null, unit: "", room: "", description: "" });
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Tambah Unit
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <colgroup>
            <col style={{ width: "80px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "200px" }} />
            <col />
            <col style={{ width: "150px" }} />
          </colgroup>
          
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">No</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Nama Unit</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Nama Room</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Game Terinstall</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {units.map((u, index) => (
              <tr key={u.id_unit} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3 text-sm font-normal text-gray-500">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-gray-900 dark:text-white">
                  {u.nama_unit}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-gray-700 dark:text-gray-300">
                  {u.room?.nama_room ?? "-"}
                </td>

                {/* UBAH KOLOM DESKRIPSI JADI TOMBOL GAME */}
                <td className="px-4 py-3">
                  <button 
                    onClick={() => setSelectedUnitForGames(u)}
                    className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    <Gamepad2 className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                    <span>{u._count?.installed_games || 0} Game</span>
                  </button>
                </td>

                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      title="Edit"
                      onClick={() => openEdit(u)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      title="Hapus"
                      onClick={() => setDeleteConfirm({ open: true, id: u.id_unit })}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {units.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada unit ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between rounded-b-2xl mt-[-1rem] z-10 relative">
        <p className="text-gray-500 dark:text-gray-400">
          Menampilkan unit{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          </span>
          {" - "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(page * PAGE_SIZE, total)}
          </span>
          <span className="ml-2 text-xs text-gray-400">
            (Total {total} unit)
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
            Hal {page} / {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold transition-all
              ${page >= totalPages 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MODAL 1: CREATE / EDIT UNIT (FISIK) */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">
              {newUnit.id ? "Edit Unit" : "Tambah Unit"}
            </h2>

            <form className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Nama Unit</span>
                <input
                  value={newUnit.unit}
                  onChange={(e) => setNewUnit((s) => ({ ...s, unit: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Nama Room</span>
                <select
                  value={newUnit.room}
                  onChange={(e) => setNewUnit((s) => ({ ...s, room: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">-- Pilih Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id_room} value={r.id_room}>
                      {r.nama_room}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Deskripsi</span>
                <input
                  value={newUnit.description}
                  onChange={(e) =>
                    setNewUnit((s) => ({ ...s, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

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
                  onClick={saveUnit}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GAME MANAGER (POPUP ISI GAME) */}
      {selectedUnitForGames && (
        <GameManagerModal 
          unit={selectedUnitForGames} 
          onClose={() => setSelectedUnitForGames(null)} 
          showNotif={showNotif}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold">Hapus Unit?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>

              <button
                onClick={doDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
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
          className={`fixed bottom-6 right-6 z-[9999] rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 ${
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


function GameManagerModal({ unit, onClose, showNotif }) {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;
  const [allGamesPage, setAllGamesPage] = useState(1);
  const [allGamesTotalPages, setAllGamesTotalPages] = useState(1);
  const [allGamesSearch, setAllGamesSearch] = useState("");
  const [removeGameConfirm, setRemoveGameConfirm] = useState({
    open: false,
    id: null,
    name: "",
  });

  useEffect(() => {
    if (unit) {
      setPage(1);
      setAllGamesPage(1);
      setAllGamesSearch("");
      fetchAllGames();
    }
  }, [unit]);

  useEffect(() => {
    if (unit) {
      fetchAllGames();
    }
  }, [unit, allGamesPage, allGamesSearch]);

  useEffect(() => {
    if (unit) {
      fetchInstalledGames();
    }
  }, [unit, page]);

  const fetchInstalledGames = async () => {
    try {
      // API: GET /unit/:id/games
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      const response = await apiGet(`/unit/${unit.id_unit}/games?${params.toString()}`);
      const list = Array.isArray(response) ? response : response?.data ?? [];
      setGames(list);
      setTotal(response?.meta?.total ?? list.length);
      setTotalPages(response?.meta?.totalPages ?? 1);
    } catch (err) { console.error(err) }
  };

  const fetchAllGames = async () => {
    try {
      // Ambil list semua game untuk dropdown
      const params = new URLSearchParams({
        page: String(allGamesPage),
        limit: "10",
        search: allGamesSearch.trim(),
      });
      const response = await apiGet(`/games?${params.toString()}`);
      const list = response.data || response || [];
      setAllGames(list);
      setAllGamesTotalPages(response.meta?.totalPages ?? 1);
    } catch (err) { console.error(err) }
  };

  const handleAddGame = async () => {
    if (!selectedGameId) return;
    setLoading(true);
    try {
      // API: POST /unit/games
      await apiPost(`/unit/games`, { id_unit: unit.id_unit, id_game: Number(selectedGameId) });
      await fetchInstalledGames(); // Refresh list lokal
      setSelectedGameId(""); // Reset dropdown
    } catch (err) {
      if (typeof showNotif === "function") {
        showNotif("Gagal menambahkan game (Mungkin sudah ada?)", "error");
      }
    }
    setLoading(false);
  };

  const requestRemoveGame = (item) => {
    setRemoveGameConfirm({
      open: true,
      id: item.id_install,
      name: item.game?.nama_game || "game ini",
    });
  };

  const cancelRemoveGame = () => {
    setRemoveGameConfirm({ open: false, id: null, name: "" });
  };

  const confirmRemoveGame = async () => {
    if (!removeGameConfirm.id) return;
    try {
      // API: DELETE /unit/games/:id
      await apiDelete(`/unit/games/${removeGameConfirm.id}`);
      await fetchInstalledGames();
      if (typeof showNotif === "function") {
        showNotif("Game berhasil dihapus dari unit.");
      }
    } catch {
      if (typeof showNotif === "function") {
        showNotif("Gagal menghapus game dari unit.", "error");
      }
    } finally {
      cancelRemoveGame();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kelola Game</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unit: {unit.nama_unit}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content: List Game */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {games.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-100 rounded-xl dark:border-gray-800">
               <Gamepad2 className="h-10 w-10 text-gray-300 mb-2" />
               <p className="text-sm text-gray-500">Belum ada game di unit ini.</p>
             </div>
          ) : (
            games.map((item) => (
              <div key={item.id_install} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <Gamepad2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.game?.nama_game || "Game tidak ditemukan"}
                  </span>
                </div>
                <button 
                  onClick={() => requestRemoveGame(item)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  title="Uninstall Game"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>
            Menampilkan{" "}
            <span className="font-semibold">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>
            {" - "}
            <span className="font-semibold">
              {total === 0 ? 0 : Math.min(page * pageSize, total)}
            </span>{" "}
            dari <span className="font-semibold">{total}</span> game
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Prev
            </button>
            <span>
              Hal {page} / {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={page >= (totalPages || 1)}
              className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Next
            </button>
          </div>
        </div>

        {/* Footer: Tambah Game */}
        <div className="border-t border-gray-100 p-5 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 rounded-b-2xl">
          <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">Install Game Baru</label>
          <div className="mb-2">
            <input
              value={allGamesSearch}
              onChange={(e) => {
                setAllGamesSearch(e.target.value);
                setAllGamesPage(1);
              }}
              placeholder="Cari game..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
            >
              <option value="">-- Pilih Game dari Library --</option>
              {allGames.map(g => (
                !games.find(installed => installed.id_game === g.id_game) && (
                  <option key={g.id_game} value={g.id_game}>{g.nama_game}</option>
                )
              ))}
            </select>
            <button 
              disabled={!selectedGameId || loading}
              onClick={handleAddGame}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "..." : "Tambah"}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Hal {allGamesPage} / {allGamesTotalPages || 1}</span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAllGamesPage((p) => Math.max(1, p - 1))}
                disabled={allGamesPage === 1}
                className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setAllGamesPage((p) => Math.min(allGamesTotalPages || 1, p + 1))}
                disabled={allGamesPage >= (allGamesTotalPages || 1)}
                className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
      {removeGameConfirm.open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Hapus Game?</h2>
              <button
                type="button"
                onClick={cancelRemoveGame}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
                title="Tutup"
              >
                x
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Hapus {removeGameConfirm.name} dari unit ini?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelRemoveGame}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRemoveGame}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
