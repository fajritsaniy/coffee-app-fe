"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// Types for menu and order
interface MenuItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_available: boolean;
}

interface OrderItem {
  menu_id: number;
  name: string;
  quantity: number;
  notes: string;
}

interface Order {
  id: number;
  table_id: number;
  items: OrderItem[];
  created_at: string;
  status: string;
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_KEY = "RAHASIA";
  const ADMIN_PASSWORD = "admin123"; // Change this in production!

  // Simple authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuth(true);
      setError("");
    } else {
      setError("Password salah");
    }
  };

  // Fetch menu stock
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/menu-items", {
        headers: { "x-api-key": API_KEY },
      });
      const data = await res.json();
      setMenu(data.data || []);
    } catch {
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/orders", {
        headers: { "x-api-key": API_KEY },
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchMenu();
      fetchOrders();
    }
    // eslint-disable-next-line
  }, [auth]);

  if (!auth) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-xs">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password admin"
              className="w-full p-3 mb-3 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded font-semibold"
            >
              Masuk
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Menu Stock Tracking */}
        <section className="flex-1 bg-white rounded shadow p-6 mb-8 md:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Stok Menu</h2>
            <button
              onClick={fetchMenu}
              className="text-xs bg-gray-200 px-3 py-1 rounded"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">Harga</th>
                <th className="p-2 border">Stok</th>
                <th className="p-2 border">Tersedia</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 border">{item.name}</td>
                  <td className="p-2 border">
                    {item.price.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td className="p-2 border text-center">
                    {item.stock ?? "-"}
                  </td>
                  <td className="p-2 border text-center">
                    {item.is_available ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Order Tracking */}
        <section className="flex-1 bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Daftar Pesanan</h2>
            <button
              onClick={fetchOrders}
              className="text-xs bg-gray-200 px-3 py-1 rounded"
              disabled={refreshing}
            >
              {refreshing ? "Memuat..." : "Refresh"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Meja</th>
                  <th className="p-2 border">Waktu</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Menu</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-2 border">{order.id}</td>
                    <td className="p-2 border">{order.table_id}</td>
                    <td className="p-2 border">
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="p-2 border">{order.status || "-"}</td>
                    <td className="p-2 border">
                      <ul className="list-disc ml-4">
                        {(order.items ?? []).map((item, idx) => (
                          <li key={idx}>
                            {item.name || item.menu_id} x{item.quantity}{" "}
                            {item.notes && (
                              <span className="italic text-xs">
                                ({item.notes})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
