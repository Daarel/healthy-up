import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminNavbar />

      <main className="ml-52 flex-1 p-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
