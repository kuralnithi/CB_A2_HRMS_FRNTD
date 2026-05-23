"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Plus, Search, ChevronRight, MapPin, Briefcase, Circle, Award, Maximize2, Minimize2, LayoutGrid, List } from "lucide-react";
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
  const [deptFilter, setDeptFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [expFilter, setExpFilter] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  async function fetchEmployees() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      // Fetch all employees to allow dynamic multi-criteria filtering client-side
      const res = await fetchApi("/employees/", token);
      if (res.ok) setEmployees(await res.json());
    } catch (e) { console.error("fetchEmployees error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => { 
    if (token) fetchEmployees(); 
  }, [token, sessionStatus]);

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  // Derive unique lists dynamically for filters
  const departments = Array.from(new Set(employees.map(e => e.department_name).filter(Boolean))) as string[];
  const workModes = Array.from(new Set(employees.map(e => e.work_location).filter(Boolean))) as string[];

  // Multi-criteria client-side filter
  const filteredEmployees = employees.filter(emp => {
    // 1. Search Filter (matches name, designation, skills, certifications, or employee code)
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = emp.name?.toLowerCase().includes(q);
      const desMatch = emp.designation?.toLowerCase().includes(q);
      const skillsMatch = emp.skills?.toLowerCase().includes(q);
      const certsMatch = emp.certifications?.toLowerCase().includes(q);
      const codeMatch = emp.employee_code?.toLowerCase().includes(q);
      if (!nameMatch && !desMatch && !skillsMatch && !certsMatch && !codeMatch) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter && emp.employment_status !== statusFilter) return false;

    // 3. Department Filter
    if (deptFilter && emp.department_name !== deptFilter) return false;

    // 4. Work Mode Filter
    if (workModeFilter && emp.work_location !== workModeFilter) return false;

    // 5. Experience Filter
    if (expFilter) {
      const exp = emp.years_of_experience || 0;
      if (expFilter === "0-2" && (exp < 0 || exp > 2)) return false;
      if (expFilter === "3-5" && (exp < 3 || exp > 5)) return false;
      if (expFilter === "6+" && exp < 6) return false;
    }

    return true;
  });

  return (
    <div className={`space-y-6 transition-all duration-300 overflow-hidden flex flex-col group ${
      isFullscreen 
        ? "fixed inset-0 z-[100] p-6 bg-white dark:bg-zinc-950 h-screen w-screen" 
        : "relative flex-1 min-h-0 w-full"
    }`}>
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "MANAGER" ? "My Team" : role === "EMPLOYEE" ? "My Profile" : "Employee Directory"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {role === "ADMIN" ? "All employees across the organization" : role === "MANAGER" ? "Employees under your management" : "Your employee profile"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {role === "ADMIN" && (
            <Link href="/dashboard/directory/new"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Add Employee
            </Link>
          )}
        </div>
      </div>

      {/* Filters - only for admin/manager */}
      {isAdminOrManager && (
        <div className="bg-zinc-50/50 dark:bg-zinc-800/10 border dark:border-zinc-800/80 p-4 rounded-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search name, skills, title..."
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-zinc-400 shadow-sm" 
                />
              </div>
            </div>

            {/* Dropdowns row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-grow w-full">
            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Department</label>
              <select 
                value={deptFilter} 
                onChange={e => setDeptFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Work Mode</label>
              <select 
                value={workModeFilter} 
                onChange={e => setWorkModeFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Work Modes</option>
                {workModes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Experience</label>
              <select 
                value={expFilter} 
                onChange={e => setExpFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Experience</option>
                <option value="0-2">0 - 2 Years</option>
                <option value="3-5">3 - 5 Years</option>
                <option value="6+">6+ Years</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">View Mode</label>
              <div className="flex items-center gap-1.5 h-[38px]">
                <div className="flex items-center gap-1 border dark:border-zinc-800 rounded-lg p-1 bg-white dark:bg-zinc-900 shadow-sm h-full flex-grow">
                  <button
                    type="button"
                    onClick={() => setViewType("grid")}
                    className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center gap-1 text-[11px] font-medium h-full ${
                      viewType === "grid" 
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50" 
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-3 w-3" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewType("list")}
                    className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center gap-1 text-[11px] font-medium h-full ${
                      viewType === "list" 
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50" 
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                    title="List View"
                  >
                    <List className="h-3 w-3" />
                    List
                  </button>
                </div>

                {/* Fullscreen Button */}
                {isAdminOrManager && (
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-full aspect-square flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border dark:border-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900"
                    title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Employees Grid Section */}
      <div className="overflow-y-auto pr-1 flex-grow min-h-0 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
          <Users className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">No employees found matching these filters</p>
        </div>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const s = STATUS_COLORS[emp.employment_status] || STATUS_COLORS.ACTIVE;
            const initials = emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
            return (
              <Link key={emp.id} href={`/dashboard/directory/${emp.id}`}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all p-5 group flex flex-col gap-3">
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
                  {emp.years_of_experience !== undefined && emp.years_of_experience !== null && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Award className="h-3.5 w-3.5" />{emp.years_of_experience} Year{emp.years_of_experience !== 1 ? "s" : ""} Exp
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                {emp.skills && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {emp.skills.split(",").slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-[10px] font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-100 dark:border-zinc-800/80">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
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
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-4">Department</th>
                  <th className="py-4 px-4">Work Mode</th>
                  <th className="py-4 px-4">Experience</th>
                  <th className="py-4 px-4">Key Skills</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredEmployees.map(emp => {
                  const s = STATUS_COLORS[emp.employment_status] || STATUS_COLORS.ACTIVE;
                  const initials = emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <tr key={emp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors group">
                      <td className="py-3.5 px-6">
                        <Link href={`/dashboard/directory/${emp.id}`} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{emp.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{emp.employee_code || "—"}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">{emp.department_name || "—"}</span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{emp.designation || "—"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                          {emp.work_location || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-zinc-500">
                        {emp.years_of_experience !== undefined && emp.years_of_experience !== null ? (
                          <span className="inline-flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500/80 flex-shrink-0" />
                            {emp.years_of_experience} Yr{emp.years_of_experience !== 1 ? "s" : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {emp.skills ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {emp.skills.split(",").slice(0, 3).map((skill: string) => (
                              <span key={skill} className="text-[10px] font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-100 dark:border-zinc-800/80">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {emp.employment_status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link href={`/dashboard/directory/${emp.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                          View Profile
                          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
