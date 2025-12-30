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
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // 1. STATE HARUS KOSONG DULU (JANGAN DIISI DUMMY)
  const [stats, setStats] = useState({
    revenue: "Rp 0",
    activeRooms: "0 / 0",
    members: "0",
    issues: "0"
  });

  const [recentTransactions, setRecentTransactions] = useState([]); 

  // 2. FETCH DATA SAAT HALAMAN DIBUKA
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Ambil Stats (Kartu Atas)
      const statsData = await apiGet('/dashboard/stats');
      if (statsData) setStats(statsData);

      // Ambil List Reservasi (Tabel Bawah)
      const recentData = await apiGet('/dashboard/recent');
      if (recentData) setRecentTransactions(recentData);
      
    } catch (err) {
      console.error("Gagal load dashboard", err);
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
        />
        <StatCard 
          title="Room Terpakai" 
          value={stats.activeRooms} 
          subtext="Sedang main" 
          icon={Gamepad2} 
          colorClass="bg-pink-600" 
        />
        <StatCard 
          title="Total Member" 
          value={stats.members} 
          subtext="Total pelanggan terdaftar" 
          icon={Users} 
          colorClass="bg-emerald-500" 
        />
        <Link to="/reservation">
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
        {/* 2. CHART SECTION (Placeholder) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Statistik Pendapatan</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Lihat Detail</button>
          </div>
          
          <div className="h-64 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Area Grafik Mingguan</p>
            </div>
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
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors">
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
                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-start justify-between">
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

export default Dashboard;