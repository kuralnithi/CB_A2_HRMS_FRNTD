"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Plus, Search, ChevronRight, MapPin, Briefcase, Circle } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE:        { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  BENCH:         { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500" },
  NOTICE_PERIOD: { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
  RESIGNED:      { bg: "bg-zinc-100",  text: "text-zinc-500",   dot: "bg-zinc-400" },
  ON_LEAVE:      { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
};

const STATUS_OPTIONS = ["", "ACTIVE", "BENCH", "NOTICE_PERIOD", "RESIGNED", "ON_LEAVE"];

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function DirectoryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || API_BASE).replace(/\/$/, "");

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchEmployees() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetchApi(`/employees/?${params}`, token);
      if (res.ok) setEmployees(await res.json());
    } catch (e) { console.error("fetchEmployees error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchEmployees(); }, [token, statusFilter, sessionStatus]);

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "MANAGER" ? "My Team" : role === "EMPLOYEE" ? "My Profile" : "Employee Directory"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {role === "ADMIN" ? "All employees across the organization" : role === "MANAGER" ? "Employees under your management" : "Your employee profile"}
          </p>
        </div>
        {role === "ADMIN" && (
          <Link href="/dashboard/directory/new"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Employee
          </Link>
        )}
      </div>

      {/* Filters - only for admin/manager */}
      {isAdminOrManager && (
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={e => { e.preventDefault(); fetchEmployees(); }} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </form>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
        </div>
      )}

      {/* Employees Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border">
          <Users className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => {
            const s = STATUS_COLORS[emp.employment_status] || STATUS_COLORS.ACTIVE;
            const initials = emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
            return (
              <Link key={emp.id} href={`/dashboard/directory/${emp.id}`}
                className="bg-white dark:bg-zinc-900 rounded-xl border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all p-5 group flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{emp.name}</p>
                      <p className="text-xs text-zinc-400">{emp.designation || "—"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>

                <div className="space-y-1.5">
                  {emp.department_name && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Briefcase className="h-3.5 w-3.5" />{emp.department_name}
                    </div>
                  )}
                  {emp.work_location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5" />{emp.work_location}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {emp.employment_status?.replace("_", " ")}
                  </span>
                  {emp.employee_code && (
                    <span className="text-[10px] font-mono text-zinc-400">{emp.employee_code}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
