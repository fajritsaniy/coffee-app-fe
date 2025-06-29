"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "../store/carStore";
import { useSearchParams } from "next/navigation";

export default function CheckoutConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || 1;

  const handleClose = () => {
    // Navigate to the homepage
    router.push(`/?table=${encodeURIComponent(table)}`);
    useCartStore.getState().clearCart();
  };

  return (
    <div className="flex flex-col justify-between h-screen px-6 py-8 bg-[#FAFAFA]">
      {/* Header */}
      <div className="pt-10">
        <h1 className="text-2xl font-semibold mb-4 text-left">
          Selamat menikmati pesanan Anda
        </h1>
        <p className="text-base text-gray-800 text-left">
          Mohon tunggu sebentar! Tim kami sedang menyiapkan pesanan Anda
          sekarang. Kami akan mengantarkan ke meja Anda segera setelah siap.
        </p>
      </div>

      {/* Icon + Friendly Message */}
      <div className="flex flex-col items-center justify-center flex-1 relative">
        {/* Blurry glow background */}
        <div className="absolute w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-70 z-0" />

        {/* Icon */}
        <div className="z-10">
          <Image
            src="/black-check.svg"
            alt="Pesanan dikonfirmasi"
            width={120}
            height={120}
          />
        </div>

        {/* Friendly message */}
        <p className="text-center text-gray-600 text-sm mt-6 z-10">
          Hal baik membutuhkan waktu — terima kasih atas kesabaran Anda!
        </p>
      </div>

      {/* Button */}
      <div>
        <button
          onClick={handleClose}
          className="w-full bg-black text-white text-base font-medium py-4 rounded-md"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
