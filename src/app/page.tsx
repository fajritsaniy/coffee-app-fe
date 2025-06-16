"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (name.trim() === "") {
      setError("Name is required.");
    } else {
      setError("");
      router.push(`/shop?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <SplashScreen
      splashContent={
        <div className="flex flex-col items-start space-y-2">
          <h1 className="text-5xl font-semibold">KEDAI</h1>
          <h1 className="text-5xl font-semibold">KOPI</h1>
          <h1 className="text-6xl font-extrabold">104</h1>
        </div>
      }
    >
      <main className="bg-white min-h-screen flex items-start justify-center">
        <div className="w-full max-w-md mx-auto px-6 pt-12 flex flex-col space-y-6">
          {/* Name label */}
          <label htmlFor="name">Nama</label>

          {/* Input field */}
          <input
            id="name"
            type="text"
            placeholder="Masukkan nama Anda di sini"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-4 bg-gray-200 placeholder-gray-500 rounded-md outline-none focus:ring-2 ${
              error ? "ring-2 ring-red-500" : "focus:ring-black/30"
            }`}
          />

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm font-medium">
              Nama wajib diisi.
            </p>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-full py-4 bg-black text-white rounded-md"
          >
            <span className="text-lg font-semibold">Lanjut</span>
            <ArrowRight className="ml-2 h-6 w-6" />
          </button>
        </div>
      </main>
    </SplashScreen>
  );
}
