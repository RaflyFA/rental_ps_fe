import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, ShoppingCart, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import moment from "moment";

const PAGE_SIZE = 9;

const fmtIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function QuickOrder() {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cart, setCart] = useState({});

  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservation") || "";
  const reservationName = searchParams.get("customer") || "";
  const reservationRoom = searchParams.get("room") || "";
  const reservationStart = searchParams.get("start") || "";
  const reservationEnd = searchParams.get("end") || "";
  const [notif, setNotif] = useState(null);
  const showNotif = (msg, type = "success") => {
  setNotif({ msg, type });
  setTimeout(() => setNotif(null), 2500);};

  let reservationTimeText = "";
  if (reservationStart && reservationEnd) {
    console.log(new Date(reservationStart), reservationStart);
    const start = moment.utc(reservationStart).local();
    const end = moment.utc(reservationEnd).local();
    const dateText = start.format("DD MMM YYYY");
    const startText = start.format("HH:mm");
    const endText = end.format("HH:mm");
    reservationTimeText = `${dateText} • ${startText} - ${endText}`;
  }

  const safeTotalPages = totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  useEffect(() => {
    let alive = true;

    async function fetchFoods() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          search: query.trim(),
        });

        const { data, meta } = await apiGet(`/foods?${params.toString()}`);

        if (!alive) return;
        setFoods(data || []);
        setTotal(meta?.total ?? (data ? data.length : 0));
        setTotalPages(meta?.totalPages ?? 1);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        const fallback = [
          { id_food: 1, nama_makanan: "Mie Goreng Instan", harga: 12000 },
          { id_food: 2, nama_makanan: "Mie Rebus Instan", harga: 12000 },
        ];
        setFoods(fallback);
        setTotal(fallback.length);
        setTotalPages(1);
      }
    }

    fetchFoods();
    return () => {
      alive = false;
    };
  }, [page, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const items = useMemo(() => Object.values(cart), [cart]);

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.food.harga) * item.qty,
    0
  );

  const add = (food) =>
    setCart((c) => {
      const existing = c[food.id_food];
      const nextQty = (existing?.qty || 0) + 1;
      return {
        ...c,
        [food.id_food]: { food, qty: nextQty },
      };
    });

  const dec = (food) =>
    setCart((c) => {
      const existing = c[food.id_food];
      const nextQty = (existing?.qty || 0) - 1;
      const { [food.id_food]: _, ...rest } = c;
      return nextQty > 0
        ? { ...c, [food.id_food]: { food, qty: nextQty } }
        : rest;
    });

  const remove = (id) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  async function placeOrder() {
    const payload = {
      reservation_id: Number(reservationId),
          items: items.map((i) => ({
            food_id: i.food.id_food,
            jumlah: i.qty,
          })),
        };

    try {
      await apiPost("/order-foods", payload);
      setCart({});
      showNotif("Order berhasil dibuat!");
    } catch (e) {
      console.error(e);
      showNotif("Gagal membuat order. Periksa koneksi / backend.", "error");
    }
  }

  return (
    <div>
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Quick Order</h2>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari makanan…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {foods.map((f) => (
              <div
                key={f.id_food}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-medium">{f.nama_makanan}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fmtIDR(f.harga)}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {cart[f.id_food] ? (
                    <>
                      <button
                        onClick={() => dec(f)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {cart[f.id_food]?.qty}
                      </span>
                      <button
                        onClick={() => add(f)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => add(f)}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Tambah
                    </button>
                  )}
                </div>
              </div>
            ))}

            {foods.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Tidak ada menu untuk kata kunci ini.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Menampilkan <span className="font-semibold">{from}</span>–
              <span className="font-semibold">{to}</span> dari{" "}
              <span className="font-semibold">{total}</span> menu
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                Halaman {page} / {safeTotalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(safeTotalPages, p + 1))
                }
                disabled={page === safeTotalPages}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <ShoppingCart className="h-5 w-5" /> Keranjang
            </h3>

            {items.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Belum ada item.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                {items.map(({ food, qty }) => (
                  <li
                    key={food.id_food}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium leading-tight">
                        {food.nama_makanan}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {qty} × {fmtIDR(food.harga)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dec(food)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {qty}
                      </span>
                      <button
                        onClick={() => add(food)}
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(food.id_food)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
              <span className="text-gray-700 dark:text-gray-300">
                Reservasi
              </span>
              <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                {reservationId ? (
                  <>
                    <div>ID Reservasi {reservationId}</div>
                    {reservationName && (
                      <div>Pelanggan: {reservationName}</div>
                    )}
                    {reservationRoom && <div>Ruangan: {reservationRoom}</div>}
                    {reservationTimeText && (
                      <div>Waktu: {reservationTimeText}</div>
                    )}
                  </>
                ) : (
                  <>Tidak ada reservasi terpilih (buka dari halaman reservasi)</>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
                <p className="text-xl font-bold">{fmtIDR(totalAmount)}</p>
              </div>

              <button
                disabled={items.length === 0 || !reservationId}
                onClick={placeOrder}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <ShoppingCart className="h-5 w-5" /> Buat Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
      {notif && (
        <div
          className={`fixed bottom-6 right-6 z-[999] rounded-xl px-4 py-3 text-sm shadow-lg
            ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {notif.msg}
        </div>
      )}
    </div>
  );
}
