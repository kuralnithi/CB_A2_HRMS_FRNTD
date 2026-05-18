"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, ChevronDown, X } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

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
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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

  const pendingLeaves = leaves.filter(l => l.status === "PENDING");
  const approvedLeaves = leaves.filter(l => l.status === "APPROVED");

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-12rem)] overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
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
        {!isAdminOrManager && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-[44px] bg-blue-600 text-white text-sm px-6 rounded-full hover:bg-blue-700 transition-all shadow-md font-medium whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Request Leave
          </button>
        )}
      </div>

      {/* Summary cards for admin/manager */}
      {isAdminOrManager && (
        <div className="grid grid-cols-3 gap-4 shrink-0">
          {[
            { label: "Total Requests", value: leaves.length, color: "bg-zinc-50 text-zinc-700" },
            { label: "Pending", value: pendingLeaves.length, color: "bg-amber-50 text-amber-700" },
            { label: "Approved", value: approvedLeaves.length, color: "bg-green-50 text-green-700" },
          ].map(item => (
            <div key={item.label} className={`rounded-xl border p-4 text-center shadow-sm ${item.color}`}>
              <p className="text-2xl font-bold leading-none">{item.value}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Table Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="px-5 py-4 border-b flex items-center gap-2 shrink-0">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-sm">
            {isEmployee ? "My Leave History" : "All Leave Requests"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No leave requests found</p>
              {isEmployee && (
                <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">
                  + Request your first leave
                </button>
              )}
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
                  {leaves.map(leave => {
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
}
