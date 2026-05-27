"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Ticket, Plus, X, CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, Filter, Maximize2, Minimize2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { Portal } from "@/components/ui/portal";

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "bg-blue-50 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  RESOLVED:    "bg-green-50 text-green-700 border border-green-200",
  CLOSED:      "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW:      "bg-zinc-100 text-zinc-600",
  MEDIUM:   "bg-blue-50 text-blue-700",
  HIGH:     "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

const STATUS_OPTS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  async function fetchTickets() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      // Fetch all tickets to allow fully responsive multi-criteria filtering client-side
      const res = await fetchApi("/tickets/", token);
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error("fetchTickets error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTickets(); }, [token, sessionStatus]);

  async function handleStatusChange(ticketId: number, newStatus: string) {
    setActionLoading(ticketId);
    try {
      await fetchApi(`/tickets/${ticketId}/status?new_status=${newStatus}`, token, {
        method: "PATCH",
      });
      await fetchTickets();
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true); setFormError("");
    try {
      const res = await fetchApi("/tickets/", token, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: "", description: "", priority: "MEDIUM" });
        await fetchTickets();
      } else {
        const err = await res.json();
        setFormError(err.detail || "Failed to raise ticket");
      }
    } catch { setFormError("Network error."); }
    finally { setFormLoading(false); }
  }

  // Client-side multi-criteria filtering
  const filteredTickets = tickets.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    
    if (t.created_at) {
      const tDate = new Date(t.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (tDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (tDate > end) return false;
      }
    } else if (startDate || endDate) {
      return false;
    }

    return true;
  });

  const openCount   = filteredTickets.filter(t => t.status === "OPEN").length;
  const inProgCount = filteredTickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = filteredTickets.filter(t => t.status === "RESOLVED").length;

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-12rem)] overflow-hidden space-y-4 relative group">
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 relative z-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "EMPLOYEE" ? "My Tickets" : "Support Tickets"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 truncate">
            {role === "EMPLOYEE"
              ? "Raise IT or HR support requests"
              : `${openCount} open ticket${openCount !== 1 ? "s" : ""} pending resolution`}
          </p>
        </div>

        {/* Symmetrical Center Status Indicators */}
        {isAdminOrManager && (
          <div className="flex items-center gap-2 flex-shrink-0 bg-zinc-100/50 dark:bg-zinc-800/30 border dark:border-zinc-800/80 rounded-full p-1 shadow-sm">
            {[
              { label: "Open", value: openCount, style: "bg-blue-50 text-blue-700 border-blue-100", icon: <Clock className="h-3.5 w-3.5" /> },
              { label: "In Progress", value: inProgCount, style: "bg-amber-50 text-amber-700 border-amber-100", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { label: "Resolved", value: resolvedCount, style: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${item.style}`}>
                {item.icon}
                <span>{item.value} <span className="opacity-75 font-medium">{item.label}</span></span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex justify-end flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-[40px] bg-blue-600 text-white text-sm px-6 rounded-full hover:bg-blue-700 transition-all shadow-md font-medium whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Raise Ticket
          </button>
        </div>
      </div>
 
      {/* Tickets List */}
      {(() => {
        const listCardContent = (
          <div className={`bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
            isFullscreen 
              ? "fixed inset-0 z-[9999] p-6 rounded-none border-none h-screen w-screen bg-zinc-50 dark:bg-zinc-950" 
              : "flex-1 min-h-0"
          }`}>
        <div className="px-5 py-4 border-b flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-sm">
              {role === "EMPLOYEE" ? "My Support Requests" : "All Tickets"}
            </h2>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
            title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Dynamic Filters Row */}
        <div className="px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-800/20 shrink-0">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTS.map(s => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-44">
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
              <span className="text-zinc-400 text-xs flex-shrink-0 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date range:
              </span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300" 
              />
              <span className="text-zinc-400 text-xs">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300" 
              />
              {(startDate || endDate || statusFilter || priorityFilter) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("");
                    setPriorityFilter("");
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex-shrink-0"
                  title="Clear Filters"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
 
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Ticket className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tickets raised yet</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">
                + Raise a support ticket
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tickets found matching these filters</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-zinc-800">
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-zinc-400">#{ticket.id}</span>
                      <p className="font-semibold text-sm">{ticket.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN}`}>
                        {ticket.status?.replace("_", " ")}
                      </span>
                      {ticket.priority && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM}`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                      {isAdminOrManager && ticket.employee_name && (
                        <span>By: <span className="font-medium text-zinc-600 dark:text-zinc-300">{ticket.employee_name}</span></span>
                      )}
                      {ticket.created_at && (
                        <span>{new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>
 
                  {/* Status changer for admin/manager */}
                  {isAdminOrManager && (
                    <select
                      disabled={actionLoading === ticket.id}
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={e => handleStatusChange(ticket.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      );
      return isFullscreen ? <Portal>{listCardContent}</Portal> : listCardContent;
    })()}

      {/* Raise Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-600" /> Raise a Ticket
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
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Issue Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Laptop not connecting to VPN"
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300" />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Describe the issue in detail — steps to reproduce, error messages, etc."
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-zinc-700 dark:text-zinc-300" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-sm border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {formLoading ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b bg-zinc-50 dark:bg-zinc-800/50 shrink-0">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                  <Ticket className="h-5 w-5 text-blue-600" /> #{selectedTicket.id}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{selectedTicket.title}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 flex-wrap mb-6">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.OPEN}`}>
                  Status: {selectedTicket.status?.replace("_", " ")}
                </span>
                {selectedTicket.priority && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.MEDIUM}`}>
                    Priority: {selectedTicket.priority}
                  </span>
                )}
                {selectedTicket.created_at && (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedTicket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border dark:border-zinc-800">
                  {selectedTicket.description}
                </div>
              </div>

              {isAdminOrManager && selectedTicket.employee_name && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Raised By</h3>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{selectedTicket.employee_name}</p>
                </div>
              )}
            </div>
            {isAdminOrManager && (
              <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Update Status:</span>
                <select
                  disabled={actionLoading === selectedTicket.id}
                  value={selectedTicket.status}
                  onChange={async e => {
                    await handleStatusChange(selectedTicket.id, e.target.value);
                    setSelectedTicket({ ...selectedTicket, status: e.target.value });
                  }}
                  className="text-sm border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium shadow-sm"
                >
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
