import Header from "../components/Header";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 pb-20">{children}</main>
    </div>
  );
}
