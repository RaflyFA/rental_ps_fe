import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Wallet, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { apiGet } from "../lib/api";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../store/useAuthStore";


const Dashboard = () => {
  // 1. STATE HARUS KOSONG DULU (JANGAN DIISI DUMMY)
  const currentUser = useAuthStore((s) => s.user);
  const role = (currentUser?.role || "").toLowerCase();
  const [stats, setStats] = useState({
    revenue: "Rp 0",
    activeRooms: "0 / 0",
    members: "0",
    issues: "0"
  });

  const [recentTransactions, setRecentTransactions] = useState([]); 
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [errorTrend, setErrorTrend] = useState(null);
  const [group, setGroup] = useState("week"); // 'week' | 'month' | 'year'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeRooms, setActiveRooms] = useState([]);
  const [revenueDetail, setRevenueDetail] = useState([]);
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [revenueShownTotal, setRevenueShownTotal] = useState(0);
  const [expandedRevenueId, setExpandedRevenueId] = useState(null);
  const [activeRoomsOpen, setActiveRoomsOpen] = useState(false);
  const [revenueDetailOpen, setRevenueDetailOpen] = useState(false);
  const navigate = useNavigate();
  const maxTrend = revenueTrend.length
    ? Math.max(...revenueTrend.map((p) => p.total))
    : 0;

  // 2. FETCH DATA SAAT HALAMAN DIBUKA
  // Fetch staff list if current user is owner
  useEffect(() => {
    if (role === 'owner') {
      (async () => {
        try {
          const res = await apiGet('/users?role=staff&limit=100');
          // backend may return { data } or array
          const list = res.data || res || [];
          setStaffList(list);
        } catch (err) {
          console.warn('Gagal memuat daftar staff', err);
          setStaffList([]);
        }
      })();
    }
  }, [role]);

  useEffect(() => {
    fetchDashboardData();
  }, [group, selectedYear, selectedMonth, selectedStaff]);

  const fetchDashboardData = async () => {
    setLoadingTrend(true);
    setErrorTrend(null);
    try {
      // Ambil Stats (Kartu Atas)
      const statsData = await apiGet('/dashboard/stats');
      if (statsData) setStats(statsData);

      // Ambil List Reservasi (Tabel Bawah)
      const recentData = await apiGet('/dashboard/recent');
      if (recentData) setRecentTransactions(recentData);

      // Ambil tren pendapatan dengan group parameter
      let endpoint = '/dashboard/revenue-trend?group=' + group;
      if (group === 'week') endpoint += '&days=7';
      if (group === 'month') endpoint += `&year=${selectedYear}&months=12`;
      if (group === 'year') endpoint += '&years=5';
      if (selectedStaff) endpoint += `&staffId=${selectedStaff}`;

      const trendData = await apiGet(endpoint);
      if (trendData) setRevenueTrend(trendData);
      
    } catch (err) {
      console.error("Gagal load dashboard", err);
      setErrorTrend(err?.message || 'Gagal memuat tren');
      setRevenueTrend([]);
    } finally {
      setLoadingTrend(false);
    }
  };

  const openActiveRooms = async () => {
    try {
      const data = await apiGet('/dashboard/active-rooms');
      setActiveRooms(data || []);
      setActiveRoomsOpen(true);
    } catch (err) {
      console.error("Gagal load active rooms", err);
    }
  };

  const openRevenueDetail = async () => {
    try {
      setRevenueDetailOpen(true);
      // Build params according to group
      let endpoint = '/dashboard/revenue-detail?limit=50';
      if (group === 'week') {
        endpoint += '&group=week&days=7';
      } else if (group === 'month') {
        const mm = String(selectedMonth).padStart(2, '0');
        endpoint += `&group=month&year=${selectedYear}&month=${selectedYear}-${mm}`;
      } else if (group === 'year') {
        endpoint += `&group=year&years=5`;
      }
      if (selectedStaff) endpoint += `&staffId=${selectedStaff}`;

      const data = await apiGet(endpoint);
      setRevenueDetail(data?.rows || data || []);
      setRevenueTotal(data?.totalRevenue ?? 0);
      setRevenueShownTotal(data?.shownTotal ?? 0);
      setExpandedRevenueId(null);
    } catch (err) {
      console.error("Gagal load revenue detail", err);
      setRevenueDetail([]);
      setRevenueTotal(0);
      setRevenueShownTotal(0);
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas rental hari ini.</p>
        </div>
        
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Pendapatan" 
          value={stats.revenue} 
          subtext="Total pemasukan lunas" 
          icon={Wallet} 
          colorClass="bg-indigo-600" 
          onClick={openRevenueDetail}
        />
        <StatCard 
          title="Room Terpakai" 
          value={stats.activeRooms} 
          subtext="Sedang main" 
          icon={Gamepad2} 
          colorClass="bg-pink-600" 
          onClick={openActiveRooms}
        />
        <Link to="/customer">
          <StatCard 
            title="Total Member" 
            value={stats.members} 
            subtext="Total pelanggan terdaftar" 
            icon={Users} 
            colorClass="bg-emerald-500" 
          />
        </Link>
        <Link to="/reservation?view=history&unpaid=true">
          <StatCard 
            title="Perlu Perhatian" 
            value={stats.issues} 
            subtext="Belum Bayar / Unpaid" 
            icon={AlertCircle} 
            colorClass="bg-amber-500" 
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. CHART SECTION */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Statistik Pendapatan</h3>
            <div className="flex items-center gap-3">
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-sm">
                <button
                  className={`px-3 py-1 ${group === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  onClick={() => setGroup('week')}
                >7 Hari</button>
                <button
                  className={`px-3 py-1 ${group === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  onClick={() => setGroup('month')}
                >Bulanan</button>
                <button
                  className={`px-3 py-1 ${group === 'year' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  onClick={() => setGroup('year')}
                >Tahunan</button>
              </div>

              {group === 'month' && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const y = new Date().getFullYear() - idx;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>

                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = i + 1;
                      const label = new Date(2000, i).toLocaleString('id-ID', { month: 'short' });
                      return <option key={m} value={m}>{label}</option>;
                    })}
                  </select>
                </div>
              )}

              {role === 'owner' && (
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
                >
                  <option value="">Semua Staff</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={openRevenueDetail}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Lihat Detail
              </button>
            </div>
          </div>

          <div className="h-64 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4">
            {revenueTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-400 dark:text-gray-500">
                <div>
                  <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data pendapatan mingguan.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-end gap-3">
                {revenueTrend.map((point) => {
                  const height = maxTrend === 0 ? 0 : Math.round((point.total / maxTrend) * 100);
                  const barHeight = maxTrend === 0 ? 0 : Math.round((point.total / maxTrend) * 160);

                  const label = (() => {
                    if (group === 'month') {
                      // expect point.date = 'YYYY-MM' or 'YYYY-MM-DD'
                      const mon = point.date.slice(5,7);
                      return new Date(point.date + '-01').toLocaleString('id-ID', { month: 'short' });
                    }
                    if (group === 'year') {
                      return String(point.date).slice(0,4);
                    }
                    // default (week) show day part
                    return point.date.slice(5);
                  })();

                  return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="h-40 w-full flex items-end">
                        <div
                          className="w-full rounded-lg bg-indigo-500/80"
                          style={{ height: `${Math.max(6, barHeight)}px` }}
                          title={`Rp ${point.total.toLocaleString("id-ID")}`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. RECENT ACTIVITY (REAL DATA) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Reservasi Terbaru</h3>
          <div className="space-y-4">
            
            {/* Logic: Jika Data Masih Kosong */}
            {recentTransactions.length === 0 ? (
               <p className="text-center text-gray-400 text-sm py-4">Belum ada transaksi hari ini.</p>
            ) : (
              // Logic: Loop Data Asli
              recentTransactions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/reservation?view=history&search=${encodeURIComponent(
                        item.user || ""
                      )}`
                    )
                  }
                  className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.user}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.amount}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </button>
              ))
            )}

          </div>
        </div>
      </div>

      {activeRoomsOpen && (
        <Modal title="Room Terpakai Saat Ini" onClose={() => setActiveRoomsOpen(false)}>
          {activeRooms.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada room yang aktif saat ini.</p>
          ) : (
            <div className="space-y-3">
              {activeRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold">{room.room}</p>
                    <p className="text-xs text-gray-500">{room.customer}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{new Date(room.start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div>hingga {new Date(room.end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {revenueDetailOpen && (
        <Modal title="Detail Pendapatan" onClose={() => setRevenueDetailOpen(false)}>
          {revenueDetail.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pendapatan tercatat.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div>Total pendapatan (semua): Rp {revenueTotal.toLocaleString("id-ID")}</div>
                <div>Subtotal dari data ditampilkan: Rp {revenueShownTotal.toLocaleString("id-ID")}</div>
              </div>
              {revenueDetail.map((row) => {
                const expanded = expandedRevenueId === row.id;
                return (
                  <div key={row.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRevenueId(expanded ? null : row.id)
                      }
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="font-semibold">{row.customer}</p>
                        <p className="text-xs text-gray-500">
                          {row.room} • {row.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rp {row.amount.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-gray-500">{row.method}</p>
                      </div>
                    </button>
                    {expanded && (
                      <div className="mt-2 text-xs text-gray-600">
                        {row.foods?.length > 0 ? (
                          <>
                            <p className="font-semibold">Makanan:</p>
                            <ul className="list-disc pl-4">
                              {row.foods.map((food, index) => (
                                <li key={`${row.id}-${index}`}>
                                  {food.name} x{food.qty} (Rp {food.subtotal.toLocaleString("id-ID")})
                                </li>
                              ))}
                            </ul>
                            <p className="mt-1">Total makanan: Rp {row.foodTotal.toLocaleString("id-ID")}</p>
                          </>
                        ) : (
                          <p>Tidak ada order makanan.</p>
                        )}
                        <p>Total sewa room: Rp {row.roomTotal.toLocaleString("id-ID")}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </section>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-start justify-between ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`}
  >
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className={`text-xs mt-2 text-gray-400 dark:text-gray-500`}>
        {subtext}
      </p>
    </div>
    <div className={`p-3 rounded-xl shadow-sm ${colorClass} text-white`}>
      <Icon size={24} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    Finished: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700",
    Booked: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status] || styles.Finished}`}>
      {status}
    </span>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Tutup
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Dashboard;
