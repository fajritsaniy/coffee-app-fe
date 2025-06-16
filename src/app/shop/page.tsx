"use client";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "../store/carStore";

// Type definition for a single Category from the backend
type Category = {
  id: number;
  name: string;
};

// Type definition for a single product from your backend API
type Product = {
  id: number;
  category_id: number;
  name: string;
  price: number; // Backend price is a number
  description: string;
  is_available: boolean;
  image_url: string; // Backend uses image_url
};

// Type definition for the category structure your component renders
type DisplayCategory = {
  title: string;
  items: Product[];
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Teman Kopi 104";
  const [searchQuery, setSearchQuery] = useState("");

  // State to hold data fetched from the API and a loading indicator
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the component mounts to fetch data
  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // --- 1. Fetch Categories from real API ---
        const categoriesRes = await fetch(
          "http://localhost:3001/api/v1/menu-categories",
          {
            headers: { "x-api-key": "RAHASIA" },
          }
        );
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesResponse = await categoriesRes.json();
        const allCategories: Category[] = categoriesResponse.data;

        // Create a map for easy lookup: e.g., { 1 => 'Coffee', 2 => 'Kudapan' }
        const categoryMap = new Map<number, string>();
        allCategories.forEach((cat) => {
          categoryMap.set(cat.id, cat.name);
        });

        // --- 2. Fetch Products from real API ---
        const productsRes = await fetch(
          "http://localhost:3001/api/v1/menu-items",
          {
            headers: { "x-api-key": "RAHASIA" },
          }
        );
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsResponse = await productsRes.json();
        const allProducts: Product[] = productsResponse.data;

        // --- 3. Group Products using the Category Map ---
        const groupedData = allProducts.reduce<DisplayCategory[]>(
          (acc, product) => {
            const categoryTitle =
              categoryMap.get(product.category_id) ?? "Lainnya";
            let category = acc.find((c) => c.title === categoryTitle);
            if (!category) {
              category = { title: categoryTitle, items: [] };
              acc.push(category);
            }
            category.items.push(product);
            return acc;
          },
          []
        );

        setCategories(groupedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []); // The empty dependency array [] ensures this effect runs only once.

  // The search filter logic now works on the data fetched from the API
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery, categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen flex flex-col">
      {/* Header and Search Bar (Sticky) */}
      <div className="sticky top-0 bg-white z-10 py-4 px-4 border-b">
        <h1 className="text-lg font-semibold mb-2">Hi, {name}!</h1>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 bg-gray-100 rounded-md placeholder-gray-500 outline-none focus:ring-2 focus:ring-black/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Category Sections */}
      <main className="px-4 pb-20 overflow-y-auto">
        {filteredCategories.map((category) => (
          <section key={category.title} className="mb-8">
            <h2 className="text-xl font-bold my-4">{category.title}</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {category.items.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-36 relative">
                  {/* The Link can be updated if you have a detail page */}
                  <Link href={`/shop/detail?id=${item.id}`}>
                    <div className="w-full h-28 bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative shadow-sm">
                      <img
                        src={item.image_url} // Use image_url from the backend
                        alt={item.name}
                        className="h-full w-full object-cover rounded-lg"
                        // Add a fallback for broken image URLs
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/128x96/e2e8f0/334155?text=Error";
                        }}
                      />
                      <button
                        className="absolute top-1 right-1 bg-black text-white rounded-full p-1 shadow-md hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigation from Link
                          // --- INTEGRATION POINT ---
                          // Use the data from the fetched 'item' to add to the cart
                          useCartStore.getState().addToCart({
                            id: item.id, // Use numeric ID from BE
                            name: item.name,
                            image: item.image_url, // Use image_url from BE
                            price: item.price, // Use numeric price from BE
                            qty: 1,
                            note: "",
                          });
                          // Consider adding user feedback here, like a toast notification
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </Link>
                  <div className="text-sm font-semibold truncate">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-700">
                    {/* Format the numeric price into IDR currency for display */}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(item.price)}
                  </div>
                  {/* The 'qty' description is not in your BE response, so we can use 'description' or remove it */}
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
