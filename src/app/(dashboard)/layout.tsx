import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
