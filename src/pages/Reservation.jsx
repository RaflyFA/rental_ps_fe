import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);
const IconHistory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IconCalendarDate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const toYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (date) =>
  date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function ReservationModal({ isOpen, onClose, reservation, onSave, isNew }) {
  const isEditMode = reservation != null && !isNew;
  const [formData, setFormData] = useState({
    customer_name: reservation?.customer_name || "",
    nama_room: reservation?.nama_room || "",
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  useEffect(() => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") {
      onSave(formData);
    } else {
      console.log("Form Data Disimpan (onSave not provided):", formData);
    }
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Reservasi" : "Tambah Reservasi Baru"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pelanggan
            </label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Masukkan nama pelanggan"
              className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ruangan
            </label>
            <select
              name="nama_room"
              value={formData.nama_room}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tanggal
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Waktu Mulai
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Durasi (jam)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReservationDetailModal({ isOpen, onClose, reservation, onDelete }) {
  const navigate = useNavigate();

  if (!isOpen || !reservation) return null;
  const start = new Date(reservation.waktu_mulai);
  const end = new Date(reservation.waktu_selesai);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
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
        <div className="mt-4 flex gap-3">
          <button
            onClick={() =>
              navigate(
                `/orderfoods?reservation=${reservation.id_reservation}` +
                  `&customer=${encodeURIComponent(
                    reservation.customer_name || "-"
                  )}` +
                  `&room=${encodeURIComponent(reservation.nama_room || "")}` +
                  `&start=${encodeURIComponent(reservation.waktu_mulai)}` +
                  `&end=${encodeURIComponent(
                    reservation.waktu_selesai || ""
                  )}`
              )
            }
            className="mr-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Order Food
          </button>
          <button
            onClick={() => {
              if (onDelete && reservation) {
                onDelete(reservation.id_reservation);
              }
              onClose();
            }}
            className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Batalkan Reservasi
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

const operationalHours = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 0,
];

function getSlotStatus(room, hour, selectedDateString, reservations) {
  for (const res of reservations) {
    const resDate = res.waktu_mulai.split("T")[0];
    const isSameRoom =
      res.nama_room === room.nama_room ||
      (res.nama_room === "Room 1 (PS4)" && room.id_room === 1) ||
      (res.nama_room === "Room 2 (PS4)" && room.id_room === 2) ||
      (res.nama_room === "Room 3 (PS4)" && room.id_room === 3) ||
      (res.nama_room === "PS 4 - Room 1" && room.id_room === 1) ||
      (res.nama_room === "PS 4 - Room 2" && room.id_room === 2) ||
      (res.nama_room === "PS 4 - Room 3" && room.id_room === 3) ||
      (res.nama_room === "PS 5 - Room 1" && room.id_room === 7) ||
      (res.nama_room === "PS 5 - Room 2" && room.id_room === 8) ||
      (res.nama_room === "Room 10 (PS5-VIP)" && room.id_room === 10) ||
      (res.nama_room === "PS 5 - VIP Room 1" && room.id_room === 10);

    if (isSameRoom && resDate === selectedDateString) {
      const startHour = new Date(res.waktu_mulai).getHours();
      const endHour = new Date(res.waktu_selesai).getHours();

      if (hour >= startHour && hour < endHour) {
        return {
          status: "Dibooking",
          text: res.customer_name.split(" ")[0],
          reservation: res,
          paymentStatus: res.payment_status || "UNPAID",
        };
      }
    }
  }
  return { status: "Tersedia", text: "Tersedia", paymentStatus: null };
}

function TimelineSlot({
  room,
  hour,
  dateString,
  reservations = [],
  onAvailableClick,
  onBookedClick,
  searchQuery = "",
}) {
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
    case "Dibooking":
      slotClass +=
        " bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300";
      break;
    case "Diisi":
      slotClass +=
        " bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300";
      break;
    case "Tidak Tersedia":
      slotClass +=
        " bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
      break;
  }

  const q = (searchQuery || "").trim().toLowerCase();
  const isSearchMatch =
    reservation &&
    q &&
    ((reservation.customer_name || "").toLowerCase().includes(q) ||
      (reservation.nama_room || "").toLowerCase().includes(q));

  if (isSearchMatch) {
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
      <div className="font-medium leading-tight">{text}</div>
      {isSearchMatch && reservation && (
        <div className="mt-0.5 text-[10px] opacity-90">
          {`${reservation.nama_room} • ${new Date(
            reservation.waktu_mulai
          ).getHours()}:00 - ${new Date(
            reservation.waktu_selesai
          ).getHours()}:00`}
        </div>
      )}
      {paymentStatus && (
        <div className="mt-0.5 text-[9px] font-semibold opacity-90">
          {paymentStatus}
        </div>
      )}
    </div>
  );
}

function ReservationTimeline({
  selectedDateString,
  reservations = [],
  onAvailableClick,
  onBookedClick,
  searchQuery = "",
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex">
        <div className="sticky left-0 z-10 w-[20%] min-w-[200px] border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 items-center border-b border-gray-200 p-2 dark:border-gray-800">
            <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Room
            </span>
          </div>
          <div>
            {mockRooms.map((room) => (
              <div
                key={room.id_room}
                className="flex h-16 items-center border-b border-gray-200 px-2 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {room.nama_room}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="sticky top-0 z-0 flex bg-white dark:bg-gray-900">
            {operationalHours.map((hour) => (
              <div
                key={hour}
                className="flex h-10 w-24 shrink-0 items-center justify-center border-b border-r border-gray-200 dark:border-gray-800"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

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
                    dateString={selectedDateString}
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

function ReservationHistoryTable({ reservations = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
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
                const timeRange = `${start.toLocaleDateString("id-ID")}, ${String(
                  start.getHours()
                ).padStart(2, "0")}:${String(start.getMinutes()).padStart(
                  2,
                  "0"
                )} - ${String(end.getHours()).padStart(2, "0")}:${String(
                  end.getMinutes()
                ).padStart(2, "0")}`;

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
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {res.customer_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {res.nama_room}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300">
                      {timeRange}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Rp {res.total_harga?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeColor}`}
                      >
                        {res.payment_status || "UNPAID"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete && onDelete(res.id_reservation)}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
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

export default function Reservation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [isModalNew, setIsModalNew] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailReservation, setSelectedDetailReservation] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const [historyReservations, setHistoryReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dateInputRef = useRef(null);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 2);

  const minDateString = toYYYYMMDD(today);
  const maxDateString = toYYYYMMDD(maxDate);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_search_history");
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load search history", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("rp_search_history", JSON.stringify(searchHistory));
    } catch (e) {
      console.warn("Failed to save search history", e);
    }
  }, [searchHistory]);

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

  useEffect(() => {
    fetchReservationsByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (showHistory) {
      fetchReservationHistory();
    }
  }, [showHistory]);

  async function fetchReservationsByDate(dateObj) {
    const dateStr = toYYYYMMDD(dateObj);
    try {
      setLoading(true);
      setError("");
      const data = await apiGet(`/reservations?date=${dateStr}`);
      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data reservasi.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReservationHistory() {
    try {
      const data = await apiGet("/reservations");
      setHistoryReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  const addToSearchHistory = (q) => {
    const t = q.trim();
    if (!t) return;
    setSearchHistory((prev) => {
      const without = prev.filter((s) => s.toLowerCase() !== t.toLowerCase());
      return [t, ...without].slice(0, 10);
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
    addToSearchHistory(val);
    setShowSearchDropdown(false);
    setSearchQuery(val);
  };

  const handleSelectSearchHistory = (q) => {
    setSearchQuery(q);
    setShowSearchDropdown(false);
  };

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

  const handleSaveReservation = async (formData) => {
    const payload = {
      customer_name: formData.customer_name,
      nama_room: formData.nama_room,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      payment_method: formData.payment_method || "Cash",
    };
    try {
      if (isModalNew || !selectedReservation?.id_reservation) {
        await apiPost("/reservations", payload);
      } else {
        await apiPut(`/reservations/${selectedReservation.id_reservation}`, payload
);
      }
      await fetchReservationsByDate(selectedDate);
      if (showHistory) {
        await fetchReservationHistory();
      }
      handleCloseModal();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan reservasi. Coba cek backend / console.");
    }
  };

  const handleAvailableClick = ({ room, hour, dateString }) => {
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

  const handleDeleteReservation = async (id) => {
    try {
      const ok = window.confirm("Yakin ingin menghapus reservasi ini?");
      if (!ok) return;

      await apiDelete(`/reservations/${id}`);

      setReservations((prev) => prev.filter((r) => r.id_reservation !== id));
      setHistoryReservations((prev) =>
        prev.filter((r) => r.id_reservation !== id)
      );

      if (
        selectedDetailReservation &&
        selectedDetailReservation.id_reservation === id
      ) {
        setIsDetailOpen(false);
        setSelectedDetailReservation(null);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus reservasi.");
    }
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    const userTimezoneOffset = newDate.getTimezoneOffset() * 60000;
    setSelectedDate(new Date(newDate.getTime() + userTimezoneOffset));
  };

  const handleDateButtonClick = () => {
    if (
      dateInputRef.current &&
      typeof dateInputRef.current.showPicker === "function"
    ) {
      try {
        dateInputRef.current.showPicker();
      } catch (error) {
        console.warn("showPicker() gagal, menggunakan fallback .click()", error);
        dateInputRef.current.click();
      }
    } else if (dateInputRef.current) {
      dateInputRef.current.click();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {showHistory ? "History Reservasi" : "Manajemen Reservasi"}
        </h1>
        <div className="flex w-full gap-2 md:w-auto">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-center rounded-md bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            title={showHistory ? "Kembali ke Timeline" : "Lihat History"}
          >
            <IconHistory />
          </button>
          <button
            onClick={() => handleOpenModal(null, true)}
            className="flex-grow rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-lg hover:bg-blue-700 md:flex-grow-0"
          >
            + Tambah Reservasi Baru
          </button>
        </div>
      </div>

      {showHistory ? (
        <ReservationHistoryTable
          reservations={historyReservations}
          onDelete={handleDeleteReservation}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative grow" ref={searchContainerRef}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
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
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />

              {showSearchDropdown && (
                <div className="absolute left-0 z-20 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
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
                                  className="flex w-full flex-col rounded-md p-2 text-left"
                                >
                                  <div className="rounded-md bg-yellow-100 px-3 py-2 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300">
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
                              className="flex-1 text-left text-sm text-gray-800 dark:text-gray-100"
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

            <div className="relative">
              <button
                type="button"
                onClick={handleDateButtonClick}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:w-auto"
              >
                <IconCalendarDate />
                <span>{formatDisplayDate(selectedDate)}</span>
                <IconChevronDown />
              </button>

              <input
                type="date"
                ref={dateInputRef}
                value={toYYYYMMDD(selectedDate)}
                min={minDateString}
                max={maxDateString}
                onChange={handleDateChange}
                style={{ colorScheme: "dark" }}
                className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
                aria-label="Pilih tanggal"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {loading && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Memuat data reservasi...
            </p>
          )}

          <ReservationTimeline
            selectedDateString={toYYYYMMDD(selectedDate)}
            reservations={reservations}
            onAvailableClick={handleAvailableClick}
            onBookedClick={handleBookedClick}
            searchQuery={searchQuery}
          />
        </>
      )}

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