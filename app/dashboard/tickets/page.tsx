"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Ticket, Plus, X, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api-client";

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

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function TicketsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);


  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  async function fetchTickets() {
    if (!token || sessionStatus !== "authenticated") return;
    setLoading(true);
    try {
      const url = statusFilter ? `/tickets/?status=${statusFilter}` : "/tickets/";
      const res = await fetchApi(url, token);
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error("fetchTickets error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTickets(); }, [token, sessionStatus, statusFilter]);

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

  const openCount   = tickets.filter(t => t.status === "OPEN").length;
  const inProgCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-12rem)] overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "EMPLOYEE" ? "My Tickets" : "Support Tickets"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {role === "EMPLOYEE"
              ? "Raise IT or HR support requests"
              : `${openCount} open ticket${openCount !== 1 ? "s" : ""} pending resolution`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44 hidden sm:block">
            <Select value={statusFilter || "ALL"} onValueChange={((val: string) => setStatusFilter(val === "ALL" ? "" : val)) as any}>
              <SelectTrigger className="w-full !h-[44px] border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-0 shadow-sm px-5">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl border-zinc-200 dark:border-zinc-800">
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_OPTS.map(s => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-[44px] bg-blue-600 text-white text-sm px-6 rounded-full hover:bg-blue-700 transition-all shadow-md font-medium whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Raise Ticket
          </button>
        </div>
      </div>
 
      {/* Summary - Shrinkable on small screens if needed, but here we keep it simple */}
      {isAdminOrManager && (
        <div className="grid grid-cols-3 gap-4 shrink-0">
          {[
            { label: "Open", value: openCount, style: "bg-blue-50 text-blue-700", icon: <Clock className="h-4 w-4" /> },
            { label: "In Progress", value: inProgCount, style: "bg-amber-50 text-amber-700", icon: <AlertTriangle className="h-4 w-4" /> },
            { label: "Resolved", value: resolvedCount, style: "bg-green-50 text-green-700", icon: <CheckCircle2 className="h-4 w-4" /> },
          ].map(item => (
            <div key={item.label} className={`rounded-xl border p-4 shadow-sm flex items-center gap-3 ${item.style}`}>
              {item.icon}
              <div>
                <p className="text-2xl font-bold leading-none">{item.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* Tickets List - Fixed scrollable area */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="px-5 py-4 border-b flex items-center gap-2 shrink-0">
          <Ticket className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-sm">
            {role === "EMPLOYEE" ? "My Support Requests" : "All Tickets"}
          </h2>
        </div>
 
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Ticket className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tickets yet</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">
                + Raise a support ticket
              </button>
            </div>
          ) : (
            <div className="divide-y dark:divide-zinc-800">
              {tickets.map(ticket => (
                <div key={ticket.id} className="px-5 py-4 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
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
                        <span>By: <span className="font-medium text-zinc-600">{ticket.employee_name}</span></span>
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
                      onChange={e => handleStatusChange(ticket.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0"
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

      {/* Raise Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-600" /> Raise a Ticket
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Issue Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Laptop not connecting to VPN"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Describe the issue in detail — steps to reproduce, error messages, etc."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-sm border rounded-lg hover:bg-zinc-50 transition-colors">
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
    </div>
  );
}
