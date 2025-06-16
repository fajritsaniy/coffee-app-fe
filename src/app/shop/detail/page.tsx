"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "../../store/carStore";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
};

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [note, setNote] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/v1/menu-items/${id}`,
          {
            headers: { "x-api-key": "RAHASIA" },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleMinus = () => setCount((prev) => Math.max(prev - 1, 1));
  const handlePlus = () => setCount((prev) => prev + 1);

  if (loading) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat produk...</p>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-red-500">Produk tidak ditemukan.</p>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen px-4 pb-20">
      {/* Product Image */}
      <div className="flex justify-center mb-6">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-52 object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-gray-600">
          {" "}
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(product.price)}
        </p>
      </div>

      {/* Information, Note, Quantity and Save */}
      <div className="space-y-6">
        {/* Info Text */}
        <div>
          <h2 className="font-semibold mb-1">Informasi</h2>
          <p className="text-sm text-gray-500">{product.description}</p>
        </div>

        {/* Note Textarea */}
        <textarea
          placeholder="Tinggalkan catatan untuk Penjual..."
          className="w-full bg-gray-100 p-3 rounded-md resize-none outline-none text-sm"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Quantity Selector */}
        <div className="flex justify-center">
          <div className="flex items-center border border-gray-300 rounded px-4 py-2 space-x-4">
            <button
              onClick={handleMinus}
              className="text-2xl font-semibold px-2"
            >
              −
            </button>
            <span className="text-base font-medium">{count} pcs</span>
            <button
              onClick={handlePlus}
              className="text-2xl font-semibold px-2"
            >
              +
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          className="w-full bg-black text-white py-4 rounded-md font-semibold text-lg"
          onClick={(e) => {
            e.preventDefault();
            useCartStore.getState().addToCart({
              id: product.id, // Use numeric ID from BE
              name: product.name,
              image: product.image_url,
              price: product.price,
              qty: count,
              note: note,
            });
          }}
        >
          Simpan
        </button>
      </div>
    </main>
  );
}
