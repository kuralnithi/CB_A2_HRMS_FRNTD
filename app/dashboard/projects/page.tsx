"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, ChevronRight, Users, Calendar, DollarSign, BarChart2, Plus, FolderKanban } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api-client";

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

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("");

  async function fetchProjects() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetchApi(`/projects?${params}`, token);
      if (res.ok) setProjects(await res.json());
    } catch (e) {
      console.error("fetchProjects error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, [token, statusFilter, search, sessionStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-12rem)] overflow-hidden space-y-4 sm:space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="w-full sm:w-64 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full h-[44px] pl-11 pr-4 text-sm border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </form>
          <div className="w-full sm:w-48">
            <Select value={statusFilter || "ALL"} onValueChange={((val: string) => setStatusFilter(val === "ALL" ? "" : val)) as any}>
              <SelectTrigger className="w-full !h-[44px] px-5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                <SelectItem value="ALL" className="text-sm">All Statuses</SelectItem>
                {STATUS_OPTIONS.filter(s => s !== "").map((s) => (
                  <SelectItem key={s} value={s} className="text-sm">
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === "ADMIN" && (
            <Link
              href="/dashboard/projects/new"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-6 h-[44px] rounded-full hover:bg-blue-700 transition-colors shadow-md font-medium whitespace-nowrap w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" /> New Project
            </Link>
          )}
        </div>
      </div>

      {/* Project Cards Section */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
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
        ) : (
          <div className="space-y-3 pb-4">
            {projects.map((proj) => {
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
        )}
      </div>
    </div>
  );
}
