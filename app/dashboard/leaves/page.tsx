"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, ChevronDown, X, Search, Filter, Maximize2, Minimize2, LayoutGrid, List } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { Portal } from "@/components/ui/portal";

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border border-green-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
};

const LEAVE_TYPES = ["CASUAL", "SICK", "ANNUAL"];

export default function LeavesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.token || (session?.user as any)?.accessToken;

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [form, setForm] = useState({
    leave_type: "CASUAL",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  async function fetchLeaves() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      const res = await fetchApi("/leaves/", token, { cache: "no-store" });
      if (res.ok) setLeaves(await res.json());
    } catch (e) { console.error("fetchLeaves error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => { 
    if (token) fetchLeaves(); 
  }, [token, sessionStatus]);

  async function handleAction(leaveId: number, status: "APPROVED" | "REJECTED") {
    setActionLoading(leaveId);
    try {
      const res = await fetchApi(`/leaves/${leaveId}?status=${status}`, token, {
        method: "PATCH",
      });
      if (res.ok) await fetchLeaves();
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true); setFormError("");
    try {
      const res = await fetchApi("/leaves/", token, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ leave_type: "CASUAL", start_date: "", end_date: "", reason: "" });
        await fetchLeaves();
      } else {
        const err = await res.json();
        setFormError(err.detail || "Failed to submit leave request");
      }
    } catch { setFormError("Network error. Please try again."); }
    finally { setFormLoading(false); }
  }

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  const filteredLeaves = leaves.filter(leave => {
    if (searchName && !leave.employee_name?.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (filterType !== "ALL" && leave.leave_type !== filterType) return false;
    if (filterStatus !== "ALL" && leave.status !== filterStatus) return false;
    if (filterStartDate && new Date(leave.start_date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(leave.end_date) > new Date(filterEndDate)) return false;
    return true;
  });

  const pendingLeaves = filteredLeaves.filter(l => l.status === "PENDING");
  const approvedLeaves = filteredLeaves.filter(l => l.status === "APPROVED");

  const mainContent = (
    <div className={`space-y-4 transition-all duration-300 overflow-hidden flex flex-col group ${
      isFullscreen 
        ? "fixed inset-0 z-[9999] p-6 bg-zinc-50 dark:bg-zinc-950 h-screen w-screen" 
        : "relative flex-1 min-h-0 w-full"
    }`}>
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEmployee ? "My Leaves" : "Leave Management"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isEmployee
              ? "Request and track your leave history"
              : role === "MANAGER"
              ? `${pendingLeaves.length} pending request${pendingLeaves.length !== 1 ? "s" : ""} from your team`
              : `${pendingLeaves.length} pending leave request${pendingLeaves.length !== 1 ? "s" : ""} organization-wide`}
          </p>
        </div>

        {/* Symmetrical Center Status Indicators */}
        {isAdminOrManager && (
          <div className="flex items-center gap-2 flex-shrink-0 bg-zinc-100/50 dark:bg-zinc-800/30 border dark:border-zinc-800/80 rounded-full p-1 shadow-sm">
            {[
              { label: "Total Requests", value: filteredLeaves.length, style: "bg-zinc-50 text-zinc-700 border-zinc-100" },
              { label: "Pending", value: pendingLeaves.length, style: "bg-amber-50 text-amber-700 border-amber-100" },
              { label: "Approved", value: approvedLeaves.length, style: "bg-green-50 text-green-700 border-green-100" },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${item.style}`}>
                <span>{item.value} <span className="opacity-75 font-medium">{item.label}</span></span>
              </div>
            ))}
          </div>
        )}

        {!isAdminOrManager && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-[44px] bg-blue-600 text-white text-sm px-6 rounded-full hover:bg-blue-700 transition-all shadow-md font-medium whitespace-nowrap self-end sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Request Leave
          </button>
        )}
      </div>

      {/* Leave Table Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm flex flex-col flex-grow min-h-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-sm">
              {isEmployee ? "My Leave History" : "All Leave Requests"}
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-800/20 shrink-0">
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdminOrManager ? "md:grid-cols-6" : "md:grid-cols-5"} gap-3 items-center`}>
            {isAdminOrManager && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input type="text" placeholder="Search by name..." value={searchName} onChange={e => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Types</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} 
                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-zinc-400 text-sm">to</span>
              <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} 
                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* View Mode & Fullscreen */}
            <div>
              <div className="flex items-center gap-1.5 h-[34px]">
                <div className="flex items-center gap-1 border dark:border-zinc-800 rounded-lg p-1 bg-white dark:bg-zinc-900 shadow-sm h-full flex-grow">
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
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-full aspect-square flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border dark:border-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900 flex-shrink-0"
                  title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No leave requests found for these filters</p>
              {isEmployee && (
                <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">
                  + Request your first leave
                </button>
              )}
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {filteredLeaves.map(leave => {
                const start = new Date(leave.start_date);
                const end = new Date(leave.end_date);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const isProcessing = actionLoading === leave.id;
                const initials = leave.employee_name 
                  ? leave.employee_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() 
                  : "EE";

                return (
                  <div 
                    key={leave.id} 
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 group"
                  >
                    {/* Top Row: Type and Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-100/50 dark:border-blue-900/30">
                        {leave.leave_type?.replace("_", " ")}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[leave.status] || STATUS_STYLES.PENDING}`}>
                        {leave.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {leave.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {leave.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {leave.status}
                      </span>
                    </div>

                    {/* Middle Section: Employee & Duration */}
                    <div className="space-y-3">
                      {isAdminOrManager && (
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                              {leave.employee_name || "Unknown Employee"}
                            </h3>
                            <p className="text-[10px] text-zinc-400">Employee Request</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                            {end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{days} day{days !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/50 flex-grow">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2" title={leave.reason}>
                        &ldquo;{leave.reason}&rdquo;
                      </p>
                    </div>

                    {/* Action Row for Admin/Manager */}
                    {isAdminOrManager && (
                      <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 mt-1 flex items-center justify-between gap-2 shrink-0">
                        {leave.status === "PENDING" ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAction(leave.id, "APPROVED")}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleAction(leave.id, "REJECTED")}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium">Processed</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {isAdminOrManager && <th className="px-5 py-3 text-left font-medium">Employee</th>}
                    <th className="px-5 py-3 text-left font-medium">Type</th>
                    <th className="px-5 py-3 text-left font-medium">Duration</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Reason</th>
                    {isAdminOrManager && <th className="px-5 py-3 text-left font-medium">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {filteredLeaves.map(leave => {
                    const start = new Date(leave.start_date);
                    const end = new Date(leave.end_date);
                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const isProcessing = actionLoading === leave.id;

                    return (
                      <tr key={leave.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        {isAdminOrManager && (
                          <td className="px-5 py-3.5 font-medium">
                            {leave.employee_name || "Unknown"}
                          </td>
                        )}
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {leave.leave_type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium">
                            {start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                            {end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-zinc-400">{days} day{days !== 1 ? "s" : ""}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[leave.status] || STATUS_STYLES.PENDING}`}>
                            {leave.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                            {leave.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                            {leave.status === "PENDING" && <Clock className="h-3 w-3" />}
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500 max-w-[200px] truncate">{leave.reason}</td>
                        {isAdminOrManager && (
                          <td className="px-5 py-3.5">
                            {leave.status === "PENDING" ? (
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(leave.id, "APPROVED")}
                                  className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approve
                                </button>
                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(leave.id, "REJECTED")}
                                  className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400">Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" /> Request Leave
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Leave Type</label>
                <select value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Start Date</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">End Date</label>
                  <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                    min={form.start_date || new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Reason</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                  placeholder="Briefly describe the reason for leave..."
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-sm border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {formLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return isFullscreen ? <Portal>{mainContent}</Portal> : mainContent;
}
