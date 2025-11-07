import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading admin workspace...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
