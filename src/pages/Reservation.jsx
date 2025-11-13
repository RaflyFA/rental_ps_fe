import React, { useState, useRef, useEffect } from "react"; // <-- Impor useRef
import { Link } from "react-router-dom";

// --- Icon SVG (Tidak diubah) ---
const IconPencil = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <path d="M15 5l4 4" />
  </svg>
);
const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);
const IconHistory = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IconCalendarDate = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

// --- Data Palsu (Mock Data) (Tidak diubah) ---
const mockReservations = [];

const mockRooms = [
  { id_room: 1, nama_room: "Room 1 (PS4)" },
  { id_room: 2, nama_room: "Room 2 (PS4)" },
  { id_room: 3, nama_room: "Room 3 (PS4)" },
  { id_room: 4, nama_room: "Room 4 (PS4)" },
  { id_room: 5, nama_room: "Room 5 (PS4)" },
  { id_room: 6, nama_room: "Room 6 (PS4)" },
  { id_room: 7, nama_room: "Room 7 (PS5)" },
  { id_room: 8, nama_room: "Room 8 (PS5)" },
  { id_room: 9, nama_room: "Room 9 (PS5)" },
  { id_room: 10, nama_room: "Room 10 (PS5-VIP)" },
];

// --- Helper Functions BARU untuk Tanggal ---
/**
 * Format JS Date object to "YYYY-MM-DD" string
 * @param {Date} date
 * @returns {string}
 */
const toYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Format JS Date object to "DD Mon YYYY" string
 * @param {Date} date
 * @returns {string}
 */
const formatDisplayDate = (date) => {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --- Komponen Modal (Diperbarui dengan State) ---
function ReservationModal({ isOpen, onClose, reservation, onSave, isNew }) {
  // If isNew true -> tambah baru. Jika reservation ada dan isNew false -> edit.
  const isEditMode = reservation != null && !isNew;

  // --- PERUBAHAN DIMULAI DI SINI ---
  // 1. Buat state untuk menampung semua data form
  const [formData, setFormData] = useState({
    customer_name: reservation?.customer_name || "",
    nama_room: reservation?.nama_room || "",
    // Gunakan helper toYYYYMMDD untuk tanggal hari ini
    date: reservation
      ? reservation.waktu_mulai
        ? reservation.waktu_mulai.split("T")[0]
        : reservation.date || toYYYYMMDD(new Date())
      : toYYYYMMDD(new Date()),
    time: reservation
      ? reservation.waktu_mulai
        ? reservation.waktu_mulai.split("T")[1].substring(0, 5)
        : reservation.time || "12:00"
      : "12:00",
    duration: reservation?.durasi || 1,
    total_bayar: reservation?.total_harga || 0,
  });

  // 2. Buat handler untuk memperbarui state saat input berubah
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Konversi ke angka jika tipenya number
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  // Jika props reservation berubah (misal prefill dari parent), sinkronkan formData
  React.useEffect(() => {
    if (!reservation) return;
    setFormData((prev) => ({
      ...prev,
      customer_name: reservation.customer_name || prev.customer_name,
      nama_room: reservation.nama_room || prev.nama_room,
      date: reservation.waktu_mulai
        ? reservation.waktu_mulai.split("T")[0]
        : reservation.date || prev.date,
      time: reservation.waktu_mulai
        ? reservation.waktu_mulai.split("T")[1].substring(0, 5)
        : reservation.time || prev.time,
      duration: reservation.durasi || reservation.duration || prev.duration,
      payment_method: reservation.payment_method || prev.payment_method,
      total_bayar: reservation.total_harga || prev.total_bayar,
    }));
  }, [reservation]);

  // 3. Perbarui handleSubmit untuk mencatat data dari state
  const handleSubmit = (e) => {
    e.preventDefault();
    // Panggil callback onSave untuk memperbarui daftar reservasi di parent
    if (typeof onSave === "function") {
      onSave(formData);
    } else {
      console.log("Form Data Disimpan (onSave not provided):", formData);
    }
    onClose(); // Tutup modal
  };
  // --- PERUBAHAN SELESAI DI SINI ---

  // Jika modal ditutup, kita kembalikan null di sini (setelah hooks dipanggil)
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Panel Modal */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {isEditMode ? "Edit Reservasi" : "Tambah Reservasi Baru"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pelanggan
            </label>
            <input
              type="text"
              name="customer_name" // <-- tetap pakai name yang sama
              value={formData.customer_name} // <-- ambil dari state
              onChange={handleChange} // <-- biar tetap bisa update formData
              placeholder="Masukkan nama pelanggan" // <-- tambahan agar lebih jelas
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ruangan
            </label>
            <select
              name="nama_room" // <-- Tambahkan name
              value={formData.nama_room} // <-- Ganti defaultValue ke value
              onChange={handleChange} // <-- Tambahkan onChange
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="" disabled>
                Pilih Ruangan
              </option>
              {mockRooms.map((r) => (
                <option key={r.id_room} value={r.nama_room}>
                  {r.nama_room}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                name="date" // <-- Tambahkan name
                value={formData.date} // <-- Ganti ke value
                onChange={handleChange} // <-- Tambahkan onChange
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                name="time" // <-- Tambahkan name
                value={formData.time} // <-- Ganti ke value
                onChange={handleChange} // <-- Tambahkan onChange
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durasi (jam)
            </label>
            <input
              type="number"
              name="duration" // <-- Tambahkan name
              value={formData.duration} // <-- Ganti defaultValue ke value
              onChange={handleChange} // <-- Tambahkan onChange
              min="1"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Komponen: Detail Modal untuk melihat info reservasi ---
function ReservationDetailModal({ isOpen, onClose, reservation, onDelete }) {
  if (!isOpen || !reservation) return null;

  const start = new Date(reservation.waktu_mulai);
  const end = new Date(reservation.waktu_selesai);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Detail Reservasi
        </h3>
        <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <div>
            <strong>Pelanggan:</strong> {reservation.customer_name}
          </div>
          <div>
            <strong>Ruangan:</strong> {reservation.nama_room}
          </div>
          <div>
            <strong>Waktu:</strong> {start.toLocaleString()} -{" "}
            {end.toLocaleTimeString()}
          </div>
          <div>
            <strong>Durasi:</strong> {reservation.durasi} jam
          </div>
          <div>
            <strong>Total:</strong> Rp {reservation.total_harga}
          </div>
          <div>
            <strong>Status Pembayaran:</strong>{" "}
            {reservation.payment_status || "-"}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              if (onDelete && reservation) {
                onDelete(reservation.id_reservation);
              }
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium"
          >
            Batalkan Reservasi
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Komponen BARU: ReservationTimeline ---

const operationalHours = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 0,
];

// Fungsi untuk cek status slot
function getSlotStatus(room, hour, selectedDateString, reservations) {
  // 1. Cek 'Dibooking' berdasarkan daftar reservations yang diberikan
  for (const res of reservations) {
    const resDate = res.waktu_mulai.split("T")[0];

    // Cocokkan room (mendukung beberapa format nama pada mock)
    const isSameRoom =
      res.nama_room === room.nama_room ||
      (res.nama_room === "Room 1 (PS4)" && room.id_room === 1) ||
      (res.nama_room === "Room 2 (PS4)" && room.id_room === 2) ||
      (res.nama_room === "Room 3 (PS4)" && room.id_room === 3) ||
      (res.nama_room === "PS 4 - Room 1" && room.id_room === 1) || // Menangani data mock lama
      (res.nama_room === "PS 4 - Room 2" && room.id_room === 2) ||
      (res.nama_room === "PS 4 - Room 3" && room.id_room === 3) ||
      (res.nama_room === "PS 5 - Room 1" && room.id_room === 7) ||
      (res.nama_room === "PS 5 - Room 2" && room.id_room === 8) ||
      (res.nama_room === "Room 10 (PS5-VIP)" && room.id_room === 10) || // Menangani data mock baru
      (res.nama_room === "PS 5 - VIP Room 1" && room.id_room === 10);

    if (isSameRoom && resDate === selectedDateString) {
      const startHour = new Date(res.waktu_mulai).getHours();
      const endHour = new Date(res.waktu_selesai).getHours();

      if (hour >= startHour && hour < endHour) {
        // Show the registrant name on every occupied hour (not only the start)
        return {
          status: "Dibooking",
          text: res.customer_name.split(" ")[0],
          reservation: res,
          paymentStatus: res.payment_status || "UNPAID",
        };
      }
    }
  }

  // 2. Jika tidak, 'Tersedia'
  return { status: "Tersedia", text: "Tersedia", paymentStatus: null };
}

// Komponen Cell/Slot
function TimelineSlot({
  room,
  hour,
  dateString,
  reservations = [],
  onAvailableClick,
  onBookedClick,
  searchQuery = "",
}) {
  // Terima dateString dan reservations sebagai prop
  const { status, text, reservation, paymentStatus } = getSlotStatus(
    room,
    hour,
    dateString,
    reservations
  );

  let slotClass =
    "h-16 border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-xs p-1 text-center whitespace-nowrap overflow-hidden text-ellipsis";

  switch (status) {
    case "Tersedia":
      slotClass +=
        " bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 opacity-60 hover:opacity-100 hover:bg-green-100 dark:hover:bg-green-800";
      break;
    case "Dibooking": // Ini untuk kotak yang ada namanya (misal "Andi")
      slotClass +=
        " bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300"; // Tetap Kuning
      break;
    case "Diisi": // <-- CASE BARU UNTUK KOTAK "Diisi"
      slotClass +=
        " bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"; // Diubah menjadi Merah
      break;
    case "Tidak Tersedia":
      slotClass +=
        " bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
      break;
  }

  // If there's a reservation here and it matches the search query, apply a strong orange highlight
  const q = (searchQuery || "").trim().toLowerCase();
  const isSearchMatch =
    reservation &&
    q &&
    ((reservation.customer_name || "").toLowerCase().includes(q) ||
      (reservation.nama_room || "").toLowerCase().includes(q));

  if (isSearchMatch) {
    // Use the same visual style as a "Dibooking" slot so the highlight matches the small boxes shown in results
    slotClass =
      "h-16 border border-yellow-600 bg-yellow-600 text-white flex flex-col items-center justify-center text-xs p-1 text-center whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer";
  }

  const handleClick = () => {
    if (status === "Tersedia") {
      if (typeof onAvailableClick === "function")
        onAvailableClick({ room, hour, dateString });
    } else if ((status === "Dibooking" || status === "Diisi") && reservation) {
      if (typeof onBookedClick === "function") onBookedClick(reservation);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={slotClass}
      title={`${room.nama_room} @ ${hour}:00 - ${status}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      {/* Primary line: name or status */}
      <div className="font-medium leading-tight">{text}</div>
      {/* If search matched, show small booking info line */}
      {isSearchMatch && reservation && (
        <div className="text-[10px] mt-0.5 opacity-90">
          {`${reservation.nama_room} • ${new Date(
            reservation.waktu_mulai
          ).getHours()}:00 - ${new Date(
            reservation.waktu_selesai
          ).getHours()}:00`}
        </div>
      )}
      {/* Show payment status below name/status text */}
      {paymentStatus && (
        <div className={`text-[9px] mt-0.5 font-semibold opacity-90`}>
          {paymentStatus}
        </div>
      )}
    </div>
  );
}

// Terima prop selectedDateString
function ReservationTimeline({
  selectedDateString,
  reservations = [],
  onAvailableClick,
  onBookedClick,
  searchQuery = "",
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="flex">
        {/* Bagian 1: Sidebar Room (Tidak diubah) */}
        <div className="w-[20%] min-w-[200px] border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky left-0 z-10">
          {/* Header Kosong */}
          <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center p-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Room
            </span>
          </div>
          {/* Daftar Room */}
          <div>
            {mockRooms.map((room) => (
              <div
                key={room.id_room}
                className="h-16 flex items-center px-2 border-b border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {room.nama_room}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian 2: Grid Waktu (Scrollable) (Tidak diubah) */}
        <div className="flex-1 overflow-x-auto">
          {/* Header Waktu */}
          <div className="flex sticky top-0 bg-white dark:bg-gray-900 z-0">
            {operationalHours.map((hour) => (
              <div
                key={hour}
                className="h-10 w-24 shrink-0 border-b border-r border-gray-200 dark:border-gray-800 flex items-center justify-center"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Body Grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${operationalHours.length}, 6rem)`,
            }}
          >
            {mockRooms.map((room) => (
              <React.Fragment key={room.id_room}>
                {operationalHours.map((hour) => (
                  <TimelineSlot
                    key={`${room.id_room}-${hour}`}
                    room={room}
                    hour={hour}
                    dateString={selectedDateString} // <-- Kirim prop ke slot
                    reservations={reservations}
                    onAvailableClick={onAvailableClick}
                    onBookedClick={onBookedClick}
                    searchQuery={searchQuery}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Komponen Halaman Utama (Sesuai file Anda) ---

/**
 * Format JS Date object to "DD Mon YYYY" string
 * @param {Date} date
 * @returns {string}
 */
// ... (formatDisplayDate function)

// --- Komponen: History Reservasi (Tabel) ---
function ReservationHistoryTable({ reservations = [], onDelete }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Pelanggan
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Ruangan
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Waktu Pesan
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Total Harga
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Status Bayar
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reservations.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada data reservasi
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const start = new Date(res.waktu_mulai);
                const end = new Date(res.waktu_selesai);
                const timeRange = `${start.toLocaleDateString(
                  "id-ID"
                )}, ${String(start.getHours()).padStart(2, "0")}:${String(
                  start.getMinutes()
                ).padStart(2, "0")} - ${String(end.getHours()).padStart(
                  2,
                  "0"
                )}:${String(end.getMinutes()).padStart(2, "0")}`;

                let statusBadgeColor =
                  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                if (res.payment_status === "PAID")
                  statusBadgeColor =
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                if (res.payment_status === "UNPAID")
                  statusBadgeColor =
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

                return (
                  <tr
                    key={res.id_reservation}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {res.customer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {res.nama_room}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-xs">
                      {timeRange}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Rp {res.total_harga?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor}`}
                      >
                        {res.payment_status || "UNPAID"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete && onDelete(res.id_reservation)}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium text-red-700 hover:bg-red-50"
                        title="Hapus reservasi"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Reservations state (start from mock data)
  const [reservations, setReservations] = useState(mockReservations);
  const [isModalNew, setIsModalNew] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailReservation, setSelectedDetailReservation] =
    useState(null);
  // Search state and history
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // load search history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_search_history");
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load search history", e);
    }
  }, []);

  // persist search history
  useEffect(() => {
    try {
      localStorage.setItem("rp_search_history", JSON.stringify(searchHistory));
    } catch (e) {
      console.warn("Failed to save search history", e);
    }
  }, [searchHistory]);

  // click outside to close dropdown
  useEffect(() => {
    function onDocClick(e) {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Search helpers
  const addToSearchHistory = (q) => {
    const t = q.trim();
    if (!t) return;
    setSearchHistory((prev) => {
      const without = prev.filter((s) => s.toLowerCase() !== t.toLowerCase());
      return [t, ...without].slice(0, 10); // keep newest first, max 10
    });
  };

  const removeFromSearchHistory = (q) => {
    setSearchHistory((prev) => prev.filter((s) => s !== q));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (q) => {
    const val = (q || searchQuery || "").trim();
    if (!val) return;
    // add to history and close dropdown
    addToSearchHistory(val);
    setShowSearchDropdown(false);
    // keep searchQuery set (so timeline filters)
    setSearchQuery(val);
  };

  const handleSelectSearchHistory = (q) => {
    setSearchQuery(q);
    setShowSearchDropdown(false);
  };

  // --- REF BARU untuk input tanggal ---
  const dateInputRef = useRef(null);

  // --- BATASAN TANGGAL BARU (3 HARI) (Tidak diubah) ---
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 2); // Hari ini + 2 hari = 3 hari total

  const minDateString = toYYYYMMDD(today);
  const maxDateString = toYYYYMMDD(maxDate);

  const handleOpenModal = (reservation = null, isNew = false) => {
    setSelectedReservation(reservation);
    setIsModalNew(isNew);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setIsModalNew(true);
  };

  const handleSaveReservation = (formData) => {
    // Build reservation object
    const start = new Date(`${formData.date}T${formData.time}:00`);
    const end = new Date(
      start.getTime() + (formData.duration || 1) * 60 * 60 * 1000
    );
    const newId =
      Math.max(0, ...reservations.map((r) => r.id_reservation || 0)) + 1;
    const pricePerHour = 7000;
    const newReservation = {
      id_reservation: newId,
      customer_name: formData.customer_name || "-",
      nama_room: formData.nama_room || formData.room || "",
      waktu_mulai: `${formData.date}T${formData.time}:00`,
      waktu_selesai: `${end.getFullYear()}-${String(
        end.getMonth() + 1
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}T${String(
        end.getHours()
      ).padStart(2, "0")}:00:00`,
      durasi: formData.duration || 1,
      total_harga: (formData.duration || 1) * pricePerHour,
      payment_status: formData.payment_status || null,
      payment_method: formData.payment_method || null,
    };

    setReservations((prev) => [...prev, newReservation]);
  };

  const handleAvailableClick = ({ room, hour, dateString }) => {
    // Prefill modal data for new reservation
    const prefill = {
      customer_name: "",
      nama_room: room.nama_room,
      date: dateString,
      time: `${String(hour).padStart(2, "0")}:00`,
      duration: 1,
      payment_method: "Cash",
      total_bayar: 0,
    };
    setSelectedReservation(prefill);
    setIsModalNew(true);
    setIsModalOpen(true);
  };

  const handleBookedClick = (reservation) => {
    setSelectedDetailReservation(reservation);
    setIsDetailOpen(true);
  };

  const handleDeleteReservation = (id) => {
    // Confirm deletion
    try {
      const ok = window.confirm("Yakin ingin menghapus reservasi ini?");
      if (!ok) return;
    } catch {
      // In non-browser environment, just proceed
    }

    setReservations((prev) => prev.filter((r) => r.id_reservation !== id));

    // If currently viewing details of the deleted reservation, close it
    if (
      selectedDetailReservation &&
      selectedDetailReservation.id_reservation === id
    ) {
      setIsDetailOpen(false);
      setSelectedDetailReservation(null);
    }
  };

  const handleDateChange = (e) => {
    // Input date memberikan string "YYYY-MM-DD" dalam UTC.
    // Konversi kembali ke Date object dengan mengimbangi timezone.
    const newDate = new Date(e.target.value);
    const userTimezoneOffset = newDate.getTimezoneOffset() * 60000;
    setSelectedDate(new Date(newDate.getTime() + userTimezoneOffset));
  };

  // --- HANDLER BARU untuk Tombol Visual ---
  const handleDateButtonClick = () => {
    // Membuka date picker secara programatik
    if (
      dateInputRef.current &&
      typeof dateInputRef.current.showPicker === "function"
    ) {
      try {
        // Cara modern
        dateInputRef.current.showPicker();
      } catch (error) {
        // Fallback jika showPicker gagal (seperti di iframe)
        console.warn(
          "showPicker() gagal, menggunakan fallback .click()",
          error
        );
        dateInputRef.current.click();
      }
    } else {
      // Fallback untuk browser yang sangat lama
      if (dateInputRef.current) {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <section className="space-y-6">
      {/* 1. Bagian Atas: Kontrol & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {showHistory ? "History Reservasi" : "Manajemen Reservasi"}
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
            title={showHistory ? "Kembali ke Timeline" : "Lihat History"}
          >
            <IconHistory />
          </button>
          <button
            onClick={() => handleOpenModal(null, true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium shadow-lg flex-grow md:flex-grow-0"
          >
            + Tambah Reservasi Baru
          </button>
        </div>
      </div>

      {/* Render History atau Timeline berdasarkan showHistory state */}
      {showHistory ? (
        <>
          {/* History View */}
          <ReservationHistoryTable
            reservations={reservations}
            onDelete={handleDeleteReservation}
          />
        </>
      ) : (
        <>
          {/* Timeline View */}
          {/* Baris Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter 1: Pencarian (Tidak diubah) */}
            <div className="relative grow" ref={searchContainerRef}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Cari nama pelanggan atau ruangan..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />

              {/* Search history dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm z-20">
                  {/* If user has typed a query, show live search results (or "no results" message). Otherwise show history. */}
                  {(() => {
                    const q = (searchQuery || "").trim().toLowerCase();
                    if (q) {
                      const matches = reservations.filter((r) => {
                        const name = (r.customer_name || "").toLowerCase();
                        const room = (r.nama_room || "").toLowerCase();
                        return name.includes(q) || room.includes(q);
                      });

                      if (matches.length === 0) {
                        return (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Tidak ada hasil untuk pencarian ini di dalam data
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col">
                          {/* Header di atas hasil pencarian */}
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200">
                            <div className="font-medium">Hasil Pencarian</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Menampilkan {matches.length} hasil yang cocok
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 p-2">
                            {matches.map((m) => {
                              const start = new Date(m.waktu_mulai);
                              const end = new Date(m.waktu_selesai);
                              const timeRange = `${String(
                                start.getHours()
                              ).padStart(2, "0")}:00 - ${String(
                                end.getHours()
                              ).padStart(2, "0")}:00`;
                              return (
                                <button
                                  key={
                                    m.id_reservation ||
                                    `${m.customer_name}-${m.waktu_mulai}`
                                  }
                                  onClick={() =>
                                    handleSelectSearchHistory(m.customer_name)
                                  }
                                  className="text-left w-full rounded-md p-2 flex flex-col"
                                >
                                  {/* Small box that visually matches the slot color */}
                                  <div className="rounded-md px-3 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300">
                                    <div className="font-semibold">
                                      {m.customer_name}
                                    </div>
                                    <div className="text-[12px] opacity-90">
                                      {m.nama_room} • {timeRange}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // No query: show search history
                    if (searchHistory.length === 0) {
                      return (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          Tidak ada history
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col">
                        {searchHistory.map((h) => (
                          <div
                            key={h}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <button
                              className="text-left text-sm text-gray-800 dark:text-gray-100 flex-1"
                              onClick={() => handleSelectSearchHistory(h)}
                            >
                              {h}
                            </button>
                            <button
                              className="ml-3 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromSearchHistory(h);
                              }}
                              aria-label={`Hapus ${h}`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Filter 2: Filter Tanggal (DIGANTI MENJADI DINAMIS) */}
            <div className="relative">
              {/* Bagian Visual (Tombol Palsu) */}
              <button
                type="button"
                onClick={handleDateButtonClick} // <-- DIUBAH: Menggunakan handler baru
                className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <IconCalendarDate />
                <span>{formatDisplayDate(selectedDate)}</span>
                <IconChevronDown />
              </button>

              {/* Bagian Fungsional (Input Asli) - TAPI TERSEMBUNYI */}
              <input
                type="date"
                ref={dateInputRef} // <-- DIUBAH: Tambahkan ref
                value={toYYYYMMDD(selectedDate)}
                min={minDateString}
                max={maxDateString}
                onChange={handleDateChange}
                // Styling untuk membuatnya transparan DAN MEMINTA DARK MODE
                style={{ colorScheme: "dark" }} // <-- DIUBAH: Meminta kalender dark mode
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" // <-- DIUBAH: pointer-events-none agar tombol bisa diklik
                aria-label="Pilih tanggal"
              />
            </div>
          </div>

          {/* 2. Bagian Bawah: Timeline */}
          {/* Show all reservations in timeline (no payment status filtering) */}
          {(() => {
            return (
              <ReservationTimeline
                selectedDateString={toYYYYMMDD(selectedDate)}
                reservations={reservations}
                onAvailableClick={handleAvailableClick}
                onBookedClick={handleBookedClick}
                searchQuery={searchQuery}
              />
            );
          })()}
        </>
      )}

      {/* 3. Order Food CTA */}
      <div className="mt-6">
        <div className="rounded-lg p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Butuh makanan atau camilan selama bermain? Anda bisa memesan makanan
            dan kami antar langsung ke ruangan.
          </p>
          <Link
            to="/foods"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Order Food
          </Link>
        </div>
      </div>

      {/* 4. Popup (Modal) (Tidak diubah) */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selectedReservation}
        isNew={isModalNew}
        onSave={handleSaveReservation}
      />

      <ReservationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        reservation={selectedDetailReservation}
        onDelete={handleDeleteReservation}
      />
    </section>
  );
}
