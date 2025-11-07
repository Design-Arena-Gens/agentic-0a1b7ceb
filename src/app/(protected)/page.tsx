import { Suspense } from "react";
import { EmployeeDashboard } from "@/components/employee/employee-dashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading dashboard...</div>}>
      <EmployeeDashboard />
    </Suspense>
  );
}
