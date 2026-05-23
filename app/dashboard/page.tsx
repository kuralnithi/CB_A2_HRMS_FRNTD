import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import ManagerDashboard from "@/components/dashboard/manager-dashboard";
import EmployeeDashboard from "@/components/dashboard/employee-dashboard";
import { fetchApi } from "@/lib/api-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;

  let stats: any = null;
  try {
    if (token) {
      const res = await fetchApi("/dashboard/stats", token, { cache: "no-store" });
      if (res.ok) stats = await res.json();
    }
  } catch (e) {
    console.error("Dashboard stats failed:", e);
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-8 h-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      {role === "ADMIN" && <AdminDashboard stats={stats} />}
      {role === "MANAGER" && <ManagerDashboard stats={stats} />}
      {role === "EMPLOYEE" && <EmployeeDashboard stats={stats} />}
    </div>
  );
}
