import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <main className="lg:ml-72 flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
