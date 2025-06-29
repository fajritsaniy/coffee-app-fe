// components/Header.tsx
"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "../store/carStore";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Teman Kopi 104";
  const table = searchParams.get("table") || 1;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="flex items-center justify-between p-4 bg-white">
      <button onClick={() => router.back()} className="p-2 flex items-center">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <Link
        href={`/cart?name=${encodeURIComponent(
          name
        )}&table=${encodeURIComponent(table)}`}
      >
        <button className="relative p-2">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </Link>
    </header>
  );
}
