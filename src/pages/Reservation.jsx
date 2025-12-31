import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import moment from "moment";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";

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
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

const normalizeRoomIdValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const normalizeRoomId = (room) => {
  if (!room) return null;
  return normalizeRoomIdValue(room.id_room ?? room.id);
};

const normalizeRoomNameKey = (roomOrName) => {
  if (!roomOrName) return "";
  if (typeof roomOrName === "string") {
    return roomOrName.trim().toLowerCase();
  }
  return (roomOrName.nama_room ?? roomOrName.name ?? "")
    .trim()
    .toLowerCase();
};

const buildRoomLookup = (rooms = []) => {
  const byId = new Map();
  const byName = new Map();
  rooms.forEach((room) => {
    const id = normalizeRoomId(room);
    if (id !== null) {
      byId.set(id, room);
    }
    const nameKey = normalizeRoomNameKey(room);
    if (nameKey) {
      byName.set(nameKey, room);
    }
  });
  return { byId, byName };
};

const normalizeReservationRoom = (reservation, roomLookup) => {
  if (!reservation) return reservation;
  const normalized = { ...reservation };
  const rawRoomId =
    reservation.room_id ??
    reservation.id_room ??
    reservation.room?.id ??
    null;
  const resolvedRoomId = normalizeRoomIdValue(rawRoomId);
  let matchedRoom =
    resolvedRoomId !== null ? roomLookup.byId.get(resolvedRoomId) : null;
  if (!matchedRoom) {
    const nameKey = normalizeRoomNameKey(
      reservation.nama_room ?? reservation.room?.name ?? "",
    );
    if (nameKey && roomLookup.byName.has(nameKey)) {
      matchedRoom = roomLookup.byName.get(nameKey);
    }
  }
  if (matchedRoom) {
    normalized.room_id = normalizeRoomId(matchedRoom);
    normalized.nama_room =
      matchedRoom.nama_room ??
      matchedRoom.name ??
      normalized.nama_room ??
      "";
  } else {
    normalized.room_id = resolvedRoomId;
    normalized.nama_room =
      normalized.nama_room ?? reservation.room?.name ?? "";
  }
  return normalized;
};

const extractHourFromString = (value) => {
  if (!value) return null;
  const str = value?.toString?.() ?? "";
  const hasDateTime = str.includes("T");
  const parser = hasDateTime
    ? moment.utc(str)
    : moment.utc(str, "HH:mm");
  if (parser.isValid()) {
    return parser.hour();
  }
  const hour = parseInt(str.split(":")[0], 10);
  return Number.isNaN(hour) ? null : hour;
};

const deriveReservationHours = (reservation) => {
  const startMoment = reservation?.waktu_mulai
    ? moment(reservation.waktu_mulai)
    : reservation?.date
      ? moment(
          `${reservation.date} ${reservation.time ?? "00:00"}`,
          "YYYY-MM-DD HH:mm",
        )
      : null;

  let endMoment = reservation?.waktu_selesai
    ? moment(reservation.waktu_selesai)
    : null;

  const duration =
    parseInt(
      reservation.duration ??
        reservation.durasi ??
        reservation.jumlah_jam ??
        1,
      10,
    ) || 1;

  if (startMoment?.isValid() && (!endMoment || !endMoment.isValid())) {
    endMoment = startMoment.clone().add(duration, "hour");
  }

  const validStart = startMoment?.isValid() ? startMoment : null;
  const validEnd = endMoment?.isValid() ? endMoment : null;
  const normalizedEnd =
    validStart && validEnd && validEnd.isBefore(validStart)
      ? validEnd.clone().add(1, "day")
      : validEnd;

  return {
    startHour: validStart ? validStart.hour() : null,
    endHour: normalizedEnd ? normalizedEnd.hour() : null,
    startMoment: validStart,
    endMoment: normalizedEnd,
  };
};

const buildReservationFormData = (reservation) => {
  const now = new Date();
  const fallbackDate = toYYYYMMDD(now);
  const fallbackTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const waktuMulai = reservation?.waktu_mulai ?? null;
  const derivedDate = waktuMulai
    ? waktuMulai.split("T")[0]
    : reservation?.date ?? fallbackDate;
  const derivedTime = waktuMulai
    ? waktuMulai.split("T")[1].substring(0, 5)
    : reservation?.time ?? fallbackTime;

  return {
    customer_id: reservation?.customer_id ?? null,
    customer_name: reservation?.customer_name ?? "",
    room_id: reservation?.room_id ?? reservation?.id_room ?? null,
    nama_room: reservation?.nama_room ?? "",
    date: derivedDate,
    time: derivedTime,
    duration: reservation?.durasi ?? reservation?.duration ?? 1,
    payment_method: reservation?.payment_method ?? "Cash",
    total_bayar: reservation?.total_harga ?? reservation?.total_bayar ?? 0,
  };
};

function ReservationModal({
  isOpen,
  onClose,
  reservation,
  onSave,
  isNew,
  rooms = [],
  roomsLoading = false,
  customers = [],
  customersLoading = false,
  customersError = "",
  customerPage = 1,
  customerTotalPages = 1,
  setCustomerPage,
  setCustomerSearch,
  showNotif,
  allowPastReservation = false,
  setAllowPastReservation,
  fetchReservations
}) {
  const isEditMode = reservation != null && !isNew;
  const [formData, setFormData] = useState(() => buildReservationFormData(reservation));
  const [customerQuery, setCustomerQuery] = useState(reservation?.customer_name ?? "");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerFieldRef = useRef(null);

  useEffect(() => {
    setFormData(buildReservationFormData(reservation));
    setCustomerQuery(reservation?.customer_name ?? "");
  }, [reservation, isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!customerFieldRef.current) return;
      if (!customerFieldRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleRoomChange = (e) => {
    const selectedId = e.target.value ? Number(e.target.value) : null;
    const room = rooms.find((r) => r.id_room === selectedId);
    setFormData((prev) => ({
      ...prev,
      room_id: room?.id_room ?? null,
      nama_room: room?.nama_room ?? "",
    }));
  };

  const handleCustomerInputChange = (e) => {
    const value = e.target.value;
    setCustomerQuery(value);
    setFormData((prev) => ({
      ...prev,
      customer_name: value,
      customer_id: null,
    }));
    if (typeof setCustomerSearch === "function") {
      setCustomerSearch(value);
    }
    if (typeof setCustomerPage === "function") {
      setCustomerPage(1);
    }
    setShowCustomerDropdown(true);
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customer.id_customer,
      customer_name: customer.nama,
    }));
    setCustomerQuery(customer.nama);
    setShowCustomerDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      if (typeof showNotif === "function") {
        showNotif("Pilih pelanggan dari daftar.", "error");
      }
      return;
    }
    if (!formData.room_id) {
      if (typeof showNotif === "function") {
        showNotif("Pilih ruangan untuk reservasi.", "error");
      }
      return;
    }
    if (typeof onSave === "function") {
      await onSave(formData);
    } else {
      console.log("Form Data Disimpan (onSave not provided):", formData);
      onClose();
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (typeof onSave === "function") {
  //     onSave(formData);
  //   } else {
  //     console.log("Form Data Disimpan (onSave not provided):", formData);
  //   }
  //   onClose();
  // };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Reservasi" : "Tambah Reservasi Baru"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={customerFieldRef} className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pelanggan
            </label>
            <input
              type="text"
              value={customerQuery}
              onChange={handleCustomerInputChange}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder={
                customersLoading ? "Memuat daftar pelanggan..." : "Cari nama pelanggan"
              }
              disabled={customersLoading && customers.length === 0}
              className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {customersError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{customersError}</p>
            )}
            {showCustomerDropdown && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {customersLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                    Memuat data pelanggan...
                  </div>
                ) : customers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                    Tidak ada pelanggan
                  </div>
                ) : (
                  customers.map((customer) => (
                    <button
                      type="button"
                      key={customer.id_customer}
                      onClick={() => handleCustomerSelect(customer)}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {customer.nama}
                      </span>
                      {customer.no_hp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.no_hp}
                        </span>
                      )}
                    </button>
                  ))
                )}
                {!customersLoading && customers.length > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <span>
                      Hal {customerPage} / {customerTotalPages}
                    </span>
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          typeof setCustomerPage === "function" &&
                          setCustomerPage((p) => Math.max(1, p - 1))
                        }
                        disabled={customerPage === 1}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-white disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          typeof setCustomerPage === "function" &&
                          setCustomerPage((p) =>
                            Math.min(customerTotalPages || 1, p + 1)
                          )
                        }
                        disabled={customerPage >= (customerTotalPages || 1)}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {formData.customer_id && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Pelanggan dipilih: {formData.customer_name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ruangan
            </label>
            <select
              name="room_id"
              value={formData.room_id ?? ""}
              onChange={handleRoomChange}
              disabled={roomsLoading && rooms.length === 0}
              className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:cursor-not-allowed"
            >
              <option value="" disabled={roomsLoading || rooms.length === 0}>
                {roomsLoading
                  ? "Memuat daftar ruangan..."
                  : rooms.length === 0
                    ? "Tidak ada ruangan"
                    : "Pilih Ruangan"}
              </option>
              {rooms.map((r) => (
                <option key={r.id_room} value={r.id_room}>
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

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={allowPastReservation}
              onChange={(e) =>
                typeof setAllowPastReservation === "function" &&
                setAllowPastReservation(e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Izinkan input manual untuk waktu yang sudah lewat
          </label>

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

function ReservationDetailModal({ isOpen, onClose, reservation, onDelete, fetchReservations, showNotif }) {
  const navigate = useNavigate();
  const [orderFoods, setOrderFoods] = useState([]);
  const [orderFoodsPage, setOrderFoodsPage] = useState(1);
  const [orderFoodsTotalPages, setOrderFoodsTotalPages] = useState(1);
  const [orderFoodsTotal, setOrderFoodsTotal] = useState(0);
  const [orderFoodsLoading, setOrderFoodsLoading] = useState(false);

  useEffect(() => {
    if (!reservation?.id_reservation) return;
    setOrderFoodsPage(1);
  }, [reservation?.id_reservation]);

  useEffect(() => {
    async function fetchOrderFoods() {
      try {
        setOrderFoodsLoading(true);
        const params = new URLSearchParams({
          page: String(orderFoodsPage),
          limit: "5",
        });
        const response = await apiGet(
          `/order-foods/by-reservation/${reservation.id_reservation}?${params.toString()}`
        );
        const list = response?.data ?? [];
        setOrderFoods(list);
        setOrderFoodsTotal(response?.meta?.total ?? list.length);
        setOrderFoodsTotalPages(response?.meta?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setOrderFoods([]);
        setOrderFoodsTotal(0);
        setOrderFoodsTotalPages(1);
      } finally {
        setOrderFoodsLoading(false);
      }
    }

    if (reservation?.id_reservation) {
      fetchOrderFoods();
    }
  }, [reservation?.id_reservation, orderFoodsPage]);

  if (!isOpen || !reservation) return null;
  const start = new Date(reservation.waktu_mulai);
  const end = new Date(reservation.waktu_selesai);
  console.log("Detail Reservation:", reservation);
  const handlePayment = async () => { 
    const response = await apiPost(`/reservations/pay/${reservation.id_reservation}`, { reservation_id: reservation.id_reservation });
    if(response){
      onClose();
      showNotif("Status pembayaran berhasil diperbarui");
      fetchReservations();
      }
    }
  return (
    <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="  w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
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
            {reservation.payment_status ? "Lunas" : "Belum Dibayar"}
          </div>
          <div>
            <strong>Metode Pembayaran:</strong>{" "}
            {reservation.payment_method || "Belum Ditentukan"}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Order Makanan
          </h4>
          {orderFoodsLoading ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Memuat order makanan...
            </p>
          ) : orderFoods.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Belum ada order makanan.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Menu</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Harga</th>
                    <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orderFoods.map((row) => {
                    const harga = Number(row.food_list?.harga ?? 0);
                    const qty = Number(row.jumlah ?? 0);
                    const subtotal = harga * qty;
                    return (
                      <tr key={row.id_order}>
                        <td className="px-3 py-2">{row.food_list?.nama_makanan ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{qty}</td>
                        <td className="px-3 py-2 text-right">Rp {harga}</td>
                        <td className="px-3 py-2 text-right">Rp {subtotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {orderFoods.length > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Menampilkan{" "}
                <span className="font-semibold">
                  {orderFoodsTotal === 0 ? 0 : (orderFoodsPage - 1) * 5 + 1}
                </span>
                {" - "}
                <span className="font-semibold">
                  {orderFoodsTotal === 0 ? 0 : Math.min(orderFoodsPage * 5, orderFoodsTotal)}
                </span>{" "}
                dari <span className="font-semibold">{orderFoodsTotal}</span> item
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOrderFoodsPage((p) => Math.max(1, p - 1))}
                  disabled={orderFoodsPage === 1}
                  className="rounded-md bg-indigo-600 px-2 py-1 text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Hal {orderFoodsPage} / {orderFoodsTotalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOrderFoodsPage((p) =>
                      Math.min(orderFoodsTotalPages || 1, p + 1)
                    )
                  }
                  disabled={orderFoodsPage >= (orderFoodsTotalPages || 1)}
                  className="rounded-md bg-indigo-600 px-2 py-1 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          {!reservation.payment_status && <button
            onClick={handlePayment}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Sudah Dibayar
          </button>}
          <button
            onClick={() => {
              const startTime = reservation.waktu_mulai
                ? moment(reservation.waktu_mulai).format()
                : "";
              const endTime = reservation.waktu_selesai
                ? moment(reservation.waktu_selesai).format()
                : "";
              navigate(
                `/orderfoods?reservation=${reservation.id_reservation}` +
                  `&customer=${encodeURIComponent(
                    reservation.customer_name || "-"
                  )}` +
                  `&room=${encodeURIComponent(reservation.nama_room || "")}` +
                  `&start=${encodeURIComponent(startTime)}` +
                  `&end=${encodeURIComponent(endTime)}`
              );
            }}
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
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
];

function getSlotStatus(room, hour, selectedDateString, reservations) {
  const timelineRoomId = normalizeRoomId(room);
  const baseDate = moment(selectedDateString, "YYYY-MM-DD");
  if (!baseDate.isValid()) {
    return { status: "Tersedia", text: "Tersedia", paymentStatus: null };
  }
  const firstHour = operationalHours[0] ?? 0;
  const slotStart = baseDate
    .clone()
    .hour(hour)
    .minute(0)
    .second(0)
    .millisecond(0);
  if (hour < firstHour) {
    slotStart.add(1, "day"); // midnight slot belongs to the next day
  }
  const slotEnd = slotStart.clone().add(1, "hour");

  for (const res of reservations) {
    const reservationRoomId = normalizeRoomIdValue(
      res.room_id ?? res.id_room ?? res.room?.id,
    );
 
    if (
      timelineRoomId === null ||
      reservationRoomId === null ||
      timelineRoomId !== reservationRoomId
    ) {
      continue;
    }
    const { startMoment, endMoment } = deriveReservationHours(res);
    if (!startMoment || !endMoment) continue;
    console.log(slotStart.format("YYYY-MM-DD HH:mm"), endMoment.format("YYYY-MM-DD HH:mm") , slotEnd.format("YYYY-MM-DD HH:mm"), startMoment.format("YYYY-MM-DD HH:mm"))
    const overlaps =
      slotStart.isBefore(endMoment) && slotEnd.isAfter(startMoment);

    if (!overlaps) continue;

    return {
      status: "Dibooking",
      text: (res.customer_name || "").split(" ")[0] || "Dibooking",
      reservation: res,
      paymentStatus: res.payment_status,
    };
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

  if (status === "Tersedia") {
     slotClass += " bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 opacity-60 hover:opacity-100 hover:bg-green-100 dark:hover:bg-green-800";
  } else if (status === "Dibooking") {
    // Check Payment Status to determine color
    if (paymentStatus === "LUNAS") {
       // Green for Paid
       slotClass += " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 cursor-pointer hover:bg-emerald-200";
    } else if (paymentStatus === "BELUM LUNAS") {
       // Orange for Partial Payment (Budi's case)
       slotClass += " bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 cursor-pointer hover:bg-yellow-200";
    } else {
       // Yellow/Red for Unpaid
       slotClass += " bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 cursor-pointer hover:bg-orange-200";
    }
  } else if (status === "Diisi") {
    slotClass += " bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300";
  } else {
    slotClass += " bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
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
  rooms = [],
  roomsLoading = false,
}) {
  if (roomsLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Memuat data ruangan...
      </div>
    );
  }

  if (!roomsLoading && rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        Tidak ada data ruangan.
      </div>
    );
  }

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
            {rooms.map((room) => (
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
            {rooms.map((room) => (
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

function ReservationHistoryTable({ reservations = [], onDelete, onPay }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <colgroup>
            <col style={{ width: "25%" }} /> {/* Pelanggan */}
            <col style={{ width: "15%" }} /> {/* Ruangan */}
            <col style={{ width: "20%" }} /> {/* Waktu */}
            <col style={{ width: "15%" }} /> {/* Harga */}
            <col style={{ width: "15%" }} /> {/* Status */}
            <col style={{ width: "10%" }} /> {/* Aksi */}
          </colgroup>
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Pelanggan</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Ruangan</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Waktu Pesan</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Total Harga</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Status Bayar</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-medium">Tidak ada data reservasi</span>
                    <span className="text-sm">Belum ada transaksi yang tercatat.</span>
                  </div>
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const start = new Date(res.waktu_mulai);
                const end = new Date(res.waktu_selesai);
                const timeRange = `${start.toLocaleDateString("id-ID")}, ${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")} - ${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

                let statusBadgeColor = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                if (res.payment_status === "LUNAS") statusBadgeColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                if (res.payment_status === "BELUM DIBAYAR") statusBadgeColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

                return (
                  <tr key={res.id_reservation} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-normal text-gray-900 dark:text-white">
                      {res.customer_name}
                    </td>
                    <td className="px-6 py-4 font-normal text-gray-700 dark:text-gray-300">
                      {res.nama_room}
                    </td>
                    <td className="px-6 py-4 font-normal text-xs text-gray-700 dark:text-gray-300">
                      {timeRange}
                    </td>
                    <td className="px-6 py-4 font-normal text-gray-900 dark:text-white">
                      Rp {res.total_harga?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs ${statusBadgeColor}`}>
                          {res.payment_status || "BELUM DIBAYAR"}
                        </span>
                      </div>
                    </td>

                    {/* 6. Aksi (Tombol) */}
                    <td className="px-6 py-4">
                      {/* WRAPPER FLEX UTAMA: Mengatur tombol ke tengah */}
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Tombol Bayar */}
                        {res.payment_status !== "LUNAS" && (
                          <button
                            onClick={() => onPay && onPay(res.id_reservation)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                            title="Tandai Sudah Bayar"
                          >
                            <IconCheck className="h-4 w-4" /> 
                            <span>Bayar</span>
                          </button>
                        )}

                        {/* Tombol Hapus (Kotak Simetris) */}
                        <button
                          onClick={() => onDelete && onDelete(res.id_reservation)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                          title="Hapus reservasi"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
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
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [isModalNew, setIsModalNew] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailReservation, setSelectedDetailReservation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const [historyReservations, setHistoryReservations] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalData, setHistoryTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [notif, setNotif] = useState(null);
  const [allowPastReservation, setAllowPastReservation] = useState(false);
  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2500);
  };
  const roomLookup = useMemo(() => buildRoomLookup(rooms), [rooms]);
  const normalizedReservations = useMemo(
    () => reservations.map((res) => normalizeReservationRoom(res, roomLookup)),
    [reservations, roomLookup],
  );
  const normalizedHistoryData = useMemo(
    () =>
      historyReservations.map((res) =>
        normalizeReservationRoom(res, roomLookup)
      ),
    [historyReservations, roomLookup]
  );

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
    const view = searchParams.get("view");
    const unpaid = searchParams.get("unpaid");
    const search = searchParams.get("search");
    if (view === "history") {
      setShowHistory(true);
    }
    if (unpaid === "true") {
      setOnlyUnpaid(true);
      setHistoryPage(1);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

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
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [customerPage, customerSearch]);

  useEffect(() => {
    if (showHistory) {
      fetchReservationHistory();
    }
  }, [showHistory, historyPage, onlyUnpaid]);

  async function fetchRooms() {
    try {
      setRoomsLoading(true);
      setRoomsError("");
      const data = await apiGet("/rooms?all=true");
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setRooms(list);
    } catch (e) {
      console.error(e);
      setRooms([]);
      setRoomsError("Gagal memuat data ruangan.");
    } finally {
      setRoomsLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      setCustomersLoading(true);
      setCustomersError("");
      const params = new URLSearchParams({
        page: String(customerPage),
        limit: "10",
        search: customerSearch.trim(),
      });
      const payload = await apiGet(`/customer?${params.toString()}`);
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setCustomers(list);
      setCustomerTotalPages(payload?.pagination?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      setCustomers([]);
      setCustomersError("Gagal memuat data pelanggan.");
      setCustomerTotalPages(1);
    } finally {
      setCustomersLoading(false);
    }
  }

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
      setLoading(true);
      // Kirim parameter page, limit, dan status unpaid ke Backend
      const unpaidParam = onlyUnpaid ? "&unpaid=true" : "";
      const url = `/reservations?page=${historyPage}&limit=10${unpaidParam}`;
      
      const response = await apiGet(url);

      // Backend sekarang mengembalikan object { data: [...], pagination: {...} }
      if (response && response.data) {
        setHistoryReservations(response.data);
        setHistoryTotalPages(response.pagination.totalPages);
        setHistoryTotalData(response.pagination.total);
      } else {
        // Fallback jaga-jaga
        setHistoryReservations([]);
        setHistoryTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      setHistoryReservations([]);
    } finally {
      setLoading(false);
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
    setAllowPastReservation(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setIsModalNew(true);
  };

  const handleSaveReservation = async (formData) => {
    if (!formData?.customer_id) {
      showNotif("Pilih pelanggan terlebih dahulu.", "error");
      return;
    }
    if (!formData?.room_id) {
      showNotif("Pilih ruangan terlebih dahulu.", "error");
      return;
    }
    const payload = {
      customer_id: formData.customer_id,
      customer_name: formData.customer_name,
      room_id: formData.room_id,
      nama_room: formData.nama_room,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      payment_method: formData.payment_method || "Cash",
      allow_past: allowPastReservation,
    };
    try {
      if (isModalNew || !selectedReservation?.id_reservation) {
        await apiPost("/reservations", payload);
        showNotif("Reservasi berhasil ditambahkan");
      } else {
        await apiPut(`/reservations/${selectedReservation.id_reservation}`, payload
);
        showNotif("Reservasi berhasil diperbarui");
      }
      await fetchReservationsByDate(selectedDate);
      if (showHistory) {
        await fetchReservationHistory();
      }
      handleCloseModal();
    } catch (e) {
      console.error(e);
      showNotif(
        e?.message || "Gagal menyimpan reservasi. Coba cek backend / console.",
        "error"
      );
    }
  };

  const handleAvailableClick = ({ room, hour, dateString }) => {
    const prefill = {
      customer_id: null,
      customer_name: "",
      room_id: room.id_room,
      id_room: room.id_room,
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

      fetchReservationsByDate(selectedDate);
    } catch (e) {
      console.error(e);
      showNotif("Gagal menghapus reservasi.", "error");
    }
  };
  const handlePayReservationHistory = async (id) => {
    try {
      await apiPost(`/reservations/pay/${id}`, { reservation_id: id });
      
      showNotif("Status pembayaran berhasil diperbarui menjadi LUNAS");
      
      await fetchReservationHistory();
      fetchReservationsByDate(selectedDate);
    } catch (e) {
      console.error(e);
      showNotif("Gagal memperbarui pembayaran.", "error");
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

  return (<>
<section className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {showHistory ? (onlyUnpaid ? "Tagihan Belum Lunas" : "History Reservasi") : "Manajemen Reservasi"}
          </h1>
          
          <div className="flex w-full gap-2 md:w-auto">
            {/* --- LOGIC TOMBOL NAVIGASI BARU --- */}
            {!showHistory ? (
              // Jika sedang di Timeline (Halaman Depan)
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowHistory(true); setOnlyUnpaid(true); }}
                  className="flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                >
                  <ReceiptText />
                </button>
                <button
                  onClick={() => { setShowHistory(true); setOnlyUnpaid(false); }}
                  className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                >
                  <IconHistory /> History
                </button>
              </div>
            ) : (
              // Jika sedang di Halaman History/Unpaid
              <div className="flex rounded-md bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => { setOnlyUnpaid(false); setHistoryPage(1); }}
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                    !onlyUnpaid 
                      ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white" 
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => { setOnlyUnpaid(true); setHistoryPage(1); }}
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                    onlyUnpaid 
                      ? "bg-red-500 text-white shadow" 
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  Belum Lunas
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="ml-2 rounded px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  ✕ Tutup
                </button>
              </div>
            )}
            
            {!showHistory && (
              <button
                onClick={() => handleOpenModal(null, true)}
                className="flex-grow rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-lg hover:bg-blue-700 md:flex-grow-0"
              >
                + Tambah Reservasi
              </button>
            )}
          </div>
        </div>

        {showHistory ? (
          <>
             {/* --- TABEL HISTORY --- */}
            <ReservationHistoryTable
              reservations={normalizedHistoryData} // Pake variabel baru tadi
              onDelete={handleDeleteReservation}
              onPay={handlePayReservationHistory}
            />

            {/* --- CONTROLS PAGINATION (BARU) --- */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60 sm:flex-row rounded-b-2xl mt-[-1rem] z-10 relative">
              
              {/* INFORMASI DATA (Kiri) */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(historyPage - 1) * 10 + 1}
                </span>
                {" - "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(historyPage * 10, historyTotalData)}
                </span>
                {" "}dari{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {historyTotalData}
                </span>{" "}
                data
              </p>
            
              {/* TOMBOL NAVIGASI (Kanan) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className={`flex items-center justify-center rounded-xl p-2 text-sm font-semibold transition-all
                    ${historyPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                      : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
            
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[80px] text-center">
                  Hal {historyPage} / {historyTotalPages || 1}
                </span>
            
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                  disabled={historyPage >= historyTotalPages}
                  className={`flex items-center justify-center rounded-xl p-2 text-sm font-semibold transition-all
                    ${historyPage >= historyTotalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                      : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
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
                      const matches = normalizedReservations.filter((r) => {
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
          {roomsError && (
            <p className="text-sm text-red-600 dark:text-red-400">{roomsError}</p>
          )}

          <ReservationTimeline
            selectedDateString={toYYYYMMDD(selectedDate)}
            reservations={normalizedReservations}
            onAvailableClick={handleAvailableClick}
            onBookedClick={handleBookedClick}
            searchQuery={searchQuery}
            rooms={rooms}
            roomsLoading={roomsLoading}
          />
        </>
      )}

      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selectedReservation}
        isNew={isModalNew}
        onSave={handleSaveReservation}
        rooms={rooms}
        roomsLoading={roomsLoading}
        customers={customers}
        customersLoading={customersLoading}
        customersError={customersError}
        customerPage={customerPage}
        customerTotalPages={customerTotalPages}
        setCustomerPage={setCustomerPage}
        setCustomerSearch={setCustomerSearch}
        showNotif={showNotif}
        allowPastReservation={allowPastReservation}
        setAllowPastReservation={setAllowPastReservation}
        fetchReservations={() => fetchReservationsByDate(selectedDate)}
      />
      <ReservationDetailModal
        isOpen={isDetailOpen}
        fetchReservations={() => fetchReservationsByDate(selectedDate)}
        onClose={() => setIsDetailOpen(false)}
        reservation={selectedDetailReservation}
        onDelete={handleDeleteReservation}
        showNotif={showNotif}
      />
    </section>
    {notif && (
        <div
          className={`
            fixed bottom-6 right-6 z-50
            rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300
            ${
              notif.type === "error"
                ? "bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                : "bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
            }
          `}
        >
          {notif.msg}
        </div>
      )}
    </>
  );
}
