"use client";

import { X, Minus, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "../store/carStore";
import { useSearchParams } from "next/navigation";

// Helper function to format numbers into Indonesian Rupiah currency
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0, // Omit decimal places for a cleaner look
  }).format(number);
};

export default function CartPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cart);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const [confirmItem, setConfirmItem] = useState<number | null>(null);
  const updateNote = useCartStore((state) => state.updateNote);
  const [notesDraft, setNotesDraft] = useState<{ [key: number]: string }>({});
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Teman Kopi 104";
  const table = searchParams.get("table") || 1;

  // Helper to build order payload
  const buildOrderPayload = () => ({
    table_id: Number(table),
    name: name,
    items: cartItems.map((item) => ({
      menu_id: item.id,
      quantity: item.qty,
      notes: item.note || "",
    })),
  });

  // Handler for checkout
  const handleCheckout = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("http://localhost:3001/api/v1/orders", {
        method: "POST",
        headers: {
          "x-api-key": "RAHASIA",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildOrderPayload()),
      });
      if (!res.ok) throw new Error("Gagal membuat pesanan");
      setConfirmCheckout(false);
      router.push(
        `/checkout-confirmation?name=${encodeURIComponent(
          name
        )}&table=${encodeURIComponent(table)}`
      );
      useCartStore.getState().clearCart();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat checkout";
      setSubmitError(errorMsg ?? "Terjadi kesalahan saat checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Pesanan Anda</h1>
        </div>
        <button
          className="bg-gray-200 text-sm px-3 py-1 rounded-full"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Selesai" : "Ubah"}
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 px-4 overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between py-3 border-b"
          >
            <span className="text-sm">{item.qty} pc</span>
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-8 object-contain"
            />
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {formatRupiah(item.price)}/pc
              </p>
              {editMode ? (
                <input
                  type="text"
                  value={notesDraft[item.id] ?? item.note ?? ""}
                  onChange={(e) =>
                    setNotesDraft((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  onBlur={() => {
                    updateNote(item.id, notesDraft[item.id] ?? "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur(); // triggers onBlur
                    }
                  }}
                  className="mt-1 text-xs italic text-gray-600 border-b focus:outline-none focus:border-black bg-transparent"
                  placeholder="Tambah catatan..."
                />
              ) : (
                item.note && (
                  <p className="text-xs text-gray-400 italic mt-1">
                    📝 {item.note}
                  </p>
                )
              )}
            </div>

            {editMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (item.qty === 1) {
                      setConfirmItem(item.id); // trigger modal instead of decreasing
                    } else {
                      decreaseQty(item.id);
                    }
                  }}
                  className="p-1 rounded bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="p-1 rounded bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmItem(item.id)}
                  className="p-1 rounded bg-red-100 text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total + Button */}
      <div className="px-4 pb-6">
        <p className="text-center mb-4 text-base">
          Total jumlah pesanan adalah <strong>{formatRupiah(total)}</strong>
        </p>
        <button
          onClick={() => setConfirmCheckout(true)}
          className={`w-full py-4 rounded-md font-semibold text-lg ${
            editMode || cartItems.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white"
          }`}
          disabled={editMode || cartItems.length === 0}
        >
          Lanjut ke Checkout
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-12/14 max-w-lg mx-auto">
            <p className="mb-4 text-base">
              Anda yakin ingin menghapus <strong>{confirmItem}</strong> dari
              keranjang?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setConfirmItem(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => {
                  removeFromCart(confirmItem);
                  setConfirmItem(null);
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCheckout && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-12/14 max-w-lg mx-auto">
            <p className="mb-4 text-base">
              Anda yakin ingin <strong>melanjutkan ke checkout</strong>?
            </p>
            {submitError && (
              <p className="text-red-500 text-sm mb-2">{submitError}</p>
            )}
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setConfirmCheckout(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-black text-white"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
