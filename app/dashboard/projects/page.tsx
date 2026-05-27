"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, ChevronRight, Users, Calendar, DollarSign, BarChart2, Plus, FolderKanban, LayoutGrid, List, Maximize2, Minimize2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { Portal } from "@/components/ui/portal";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  PLANNING:  { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  ONGOING:   { bg: "bg-green-50",   text: "text-green-700",   dot: "bg-green-500" },
  ON_HOLD:   { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  DELAYED:   { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  CANCELLED: { bg: "bg-zinc-100",   text: "text-zinc-500",    dot: "bg-zinc-400" },
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW:      "text-zinc-500 bg-zinc-100",
  MEDIUM:   "text-blue-600 bg-blue-50",
  HIGH:     "text-orange-600 bg-orange-50",
  CRITICAL: "text-red-600 bg-red-50",
};

const STATUS_OPTIONS = ["", "PLANNING", "ONGOING", "ON_HOLD", "COMPLETED", "DELAYED", "CANCELLED"];

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function ProjectsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  async function fetchProjects() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      // Fetch all projects to support dynamic client-side multi-criteria filtering
      const res = await fetchApi("/projects", token);
      if (res.ok) setProjects(await res.json());
    } catch (e) {
      console.error("fetchProjects error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    if (token) fetchProjects(); 
  }, [token, sessionStatus]);

  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Derive unique client/company list dynamically
  const companies = Array.from(new Set(projects.map(p => p.client_name).filter(Boolean))) as string[];

  // Dynamic client-side filter logic
  const filteredProjects = projects.filter(proj => {
    // 1. Search filter (name, code, description, tech stack)
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = proj.name?.toLowerCase().includes(q);
      const descMatch = proj.description?.toLowerCase().includes(q);
      const codeMatch = proj.project_code?.toLowerCase().includes(q);
      const techMatch = proj.tech_stack?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !codeMatch && !techMatch) return false;
    }

    // 2. Status filter
    if (statusFilter && proj.status !== statusFilter) return false;

    // 3. Company/Client filter
    if (companyFilter && proj.client_name !== companyFilter) return false;

    // 4. Budget Filter
    if (budgetFilter) {
      const budget = proj.budget_usd || 0;
      if (budgetFilter === "under-100k" && budget >= 100000) return false;
      if (budgetFilter === "100k-250k" && (budget < 100000 || budget > 250000)) return false;
      if (budgetFilter === "250k-500k" && (budget < 250000 || budget > 500000)) return false;
      if (budgetFilter === "over-500k" && budget < 500000) return false;
    }

    // 5. Dates / Deadline filter
    if (dateFilter) {
      const days = daysUntil(proj.deadline);
      if (dateFilter === "overdue" && (days === null || days >= 0 || proj.status === "COMPLETED")) return false;
      if (dateFilter === "next-30" && (days === null || days < 0 || days > 30)) return false;
      if (dateFilter === "next-90" && (days === null || days < 0 || days > 90)) return false;
    }

    return true;
  });

  const mainContent = (
    <div className={`space-y-6 transition-all duration-300 overflow-hidden flex flex-col group ${
      isFullscreen 
        ? "fixed inset-0 z-[9999] p-6 bg-zinc-50 dark:bg-zinc-950 h-screen w-screen" 
        : "relative flex-1 min-h-0 w-full"
    }`}>
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "EMPLOYEE" ? "My Projects" : "Project Portfolio"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {role === "EMPLOYEE"
              ? "Projects you are currently assigned to"
              : "All organization projects across teams"}
          </p>
        </div>

        {role === "ADMIN" && (
          <Link
            href="/dashboard/projects/new"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> New Project
          </Link>
        )}
      </div>

      {/* Dynamic Filters Card */}
      <div className="bg-zinc-50/50 dark:bg-zinc-800/10 border dark:border-zinc-800/80 p-4 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search Input */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Search Projects</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, tech..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-zinc-400 shadow-sm"
              />
            </div>
          </div>

          {/* Dropdowns row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-grow w-full">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.filter(s => s !== "").map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Company / Client Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Company</label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Budget</label>
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Budgets</option>
                <option value="under-100k">Under $100K</option>
                <option value="100k-250k">$100K - $250K</option>
                <option value="250k-500k">$250K - $500K</option>
                <option value="over-500k">Over $500K</option>
              </select>
            </div>

            {/* Deadline / Date Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Deadline</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Deadlines</option>
                <option value="overdue">Overdue</option>
                <option value="next-30">Next 30 Days</option>
                <option value="next-90">Next 90 Days</option>
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
                    className="h-full aspect-square flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border dark:border-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900 flex-shrink-0"
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

      {/* Project Cards Section */}
      <div className="overflow-y-auto pr-1 flex-grow min-h-0 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border">
            <FolderKanban className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No projects found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {role === "ADMIN" ? "Create your first project to get started." : "You haven't been assigned to any projects yet."}
            </p>
            {role === "ADMIN" && (
              <Link href="/dashboard/projects/new" className="mt-4 text-sm text-blue-600 hover:underline">
                + Create Project
              </Link>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <FolderKanban className="h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No projects found matching these filters</p>
          </div>
        ) : viewType === "grid" ? (
          <div className="space-y-3 pb-4">
            {filteredProjects.map((proj) => {
              const statusStyle = STATUS_COLORS[proj.status] || STATUS_COLORS.PLANNING;
              const days = daysUntil(proj.deadline);
              const isOverdue = days !== null && days < 0 && proj.status !== "COMPLETED";
              return (
                <Link
                  key={proj.id}
                  href={`/dashboard/projects/${proj.id}`}
                  className="block bg-white dark:bg-zinc-900 rounded-xl border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all p-5 group overflow-hidden max-w-full w-full"
                >
                  <div className="flex items-start justify-between gap-4 overflow-hidden max-w-full">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap overflow-hidden max-w-full">
                        <h3 className="font-semibold text-base group-hover:text-blue-600 transition-colors truncate max-w-full">{proj.name}</h3>
                        {proj.project_code && (
                          <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-shrink-0">
                            {proj.project_code}
                          </span>
                        )}
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {proj.status?.replace("_", " ")}
                        </span>
                        {/* Priority */}
                        {proj.priority && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[proj.priority] || PRIORITY_COLORS.MEDIUM}`}>
                            {proj.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-1 break-words">{proj.description || "No description"}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap overflow-hidden w-full max-w-full">
                    {proj.client_name && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-shrink-0 max-w-[120px] truncate">
                        <BarChart2 className="h-3.5 w-3.5" />
                        {proj.client_name}
                      </div>
                    )}
                    {proj.team_size !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-shrink-0">
                        <Users className="h-3.5 w-3.5" />
                        {proj.team_size} members
                      </div>
                    )}
                    {proj.deadline && (
                      <div className={`flex items-center gap-1.5 text-xs flex-shrink-0 ${isOverdue ? "text-red-500 font-medium" : "text-zinc-400"}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {isOverdue
                          ? `Overdue by ${Math.abs(days!)} days`
                          : days !== null && days <= 14
                          ? `${days} days left`
                          : new Date(proj.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                    {role !== "EMPLOYEE" && proj.budget_usd && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-shrink-0">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${proj.budget_usd.toLocaleString()}
                      </div>
                    )}
                    {proj.tech_stack && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-shrink-0 max-w-full truncate">
                        <span className="truncate">{proj.tech_stack}</span>
                      </div>
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
                    <th className="py-4 px-6">Project Name</th>
                    <th className="py-4 px-4">Status & Priority</th>
                    <th className="py-4 px-4">Company</th>
                    <th className="py-4 px-4">Timeline</th>
                    <th className="py-4 px-4">Team</th>
                    {role !== "EMPLOYEE" && <th className="py-4 px-4">Budget</th>}
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredProjects.map((proj) => {
                    const statusStyle = STATUS_COLORS[proj.status] || STATUS_COLORS.PLANNING;
                    const days = daysUntil(proj.deadline);
                    const isOverdue = days !== null && days < 0 && proj.status !== "COMPLETED";
                    return (
                      <tr key={proj.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors group">
                        <td className="py-3.5 px-6">
                          <Link href={`/dashboard/projects/${proj.id}`} className="block">
                            <div className="font-semibold text-sm group-hover:text-blue-600 transition-colors truncate max-w-xs">{proj.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{proj.project_code || "—"}</div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                              {proj.status?.replace("_", " ")}
                            </span>
                            {proj.priority && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[proj.priority] || PRIORITY_COLORS.MEDIUM}`}>
                                {proj.priority}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {proj.client_name ? (
                            <span className="inline-flex items-center gap-1">
                              <BarChart2 className="h-3.5 w-3.5 text-zinc-400" />
                              {proj.client_name}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-500">
                          {proj.deadline ? (
                            <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : "text-zinc-500"}`}>
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              {isOverdue
                                ? `Overdue by ${Math.abs(days!)} days`
                                : days !== null && days <= 14
                                ? `${days} days left`
                                : new Date(proj.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-zinc-500">
                          {proj.team_size !== undefined ? (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-zinc-400" />
                              {proj.team_size} members
                            </span>
                          ) : "—"}
                        </td>
                        {role !== "EMPLOYEE" && (
                          <td className="py-3.5 px-4 text-sm text-zinc-500 font-medium font-mono">
                            {proj.budget_usd ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                {proj.budget_usd.toLocaleString()}
                              </span>
                            ) : "—"}
                          </td>
                        )}
                        <td className="py-3.5 px-6 text-right">
                          <Link href={`/dashboard/projects/${proj.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                            Details
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

  return isFullscreen ? <Portal>{mainContent}</Portal> : mainContent;
}
