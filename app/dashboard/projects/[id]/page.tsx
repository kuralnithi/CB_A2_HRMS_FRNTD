"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, FolderKanban, Users, Calendar, DollarSign,
  Globe, GitBranch, AlertTriangle, Plus, X, Trash2, UserPlus, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DELAYED: "bg-red-100 text-red-700",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-zinc-100 text-zinc-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const PROJECT_ROLES = [
  "Project Manager", "Team Lead", "Developer", "QA/Tester",
  "UI/UX Designer", "DevOps Engineer", "Business Analyst", "Intern"
];

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;

  const [project, setProject] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employee_id: "", role_in_project: "Developer",
    allocation_percentage: "100", is_billable: true
  });
  const [assignError, setAssignError] = useState("");


  async function fetchProject() {
    if (!token || !id) return;
    setFetchError("");
    try {
      const res = await fetchApi(`/projects/${id}`, token);
      if (res.ok) {
        setProject(await res.json());
      } else if (res.status === 404) {
        setFetchError("Project not found.");
      } else {
        setFetchError(`Server error: ${res.status}`);
      }
    } catch (e: any) {
      console.error("fetchProject error:", e);
      setFetchError(e.message || "Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmployees() {
    if (!token || role === "EMPLOYEE") return;
    try {
      const res = await fetchApi("/employees/", token);
      if (res.ok) setEmployees(await res.json());
    } catch (e) {
      console.error("fetchEmployees error:", e);
    }
  }

  useEffect(() => {
    // Wait for session to be loaded
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") return;
    setLoading(true);
    fetchProject();
    fetchEmployees();
  }, [id, token, sessionStatus]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setAssigning(true); setAssignError("");
    try {
      const res = await fetchApi(`/projects/${id}/members`, token, {
        method: "POST",
        body: JSON.stringify({
          employee_id: parseInt(assignForm.employee_id),
          role_in_project: assignForm.role_in_project,
          allocation_percentage: parseFloat(assignForm.allocation_percentage),
          is_billable: assignForm.is_billable,
        }),
      });
      if (res.ok) { setShowAssign(false); await fetchProject(); }
      else { const err = await res.json(); setAssignError(err.detail || "Failed to assign"); }
    } catch { setAssignError("Network error — cannot reach API."); }
    finally { setAssigning(false); }
  }

  async function handleRemoveMember(empId: number) {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await fetchApi(`/projects/${id}/members/${empId}`, token, {
        method: "DELETE",
      });
      await fetchProject();
    } catch (e) { console.error("remove member error:", e); }
  }

  // Still loading session
  if (sessionStatus === "loading") return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-zinc-200 rounded w-48" />
      <div className="h-40 bg-zinc-100 rounded-xl" />
    </div>
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-zinc-200 rounded w-48" />
      <div className="h-40 bg-zinc-100 rounded-xl" />
      <div className="h-60 bg-zinc-100 rounded-xl" />
    </div>
  );

  if (fetchError) return (
    <div className="text-center py-20 space-y-3">
      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
      <p className="text-zinc-700 font-medium">{fetchError}</p>
      <div className="flex justify-center gap-3">
        <button onClick={() => { setLoading(true); fetchProject(); }}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
        <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <FolderKanban className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
      <p className="text-zinc-500">Project not found</p>
      <Link href="/dashboard/projects" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to Projects</Link>
    </div>
  );

  const statusStyle = STATUS_COLORS[project.status] || "bg-zinc-100 text-zinc-600";
  const priorityStyle = PRIORITY_COLORS[project.priority] || "bg-zinc-100 text-zinc-600";
  const isAdmin = role === "ADMIN";
  const isManagerOrAdmin = role === "ADMIN" || role === "MANAGER";

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex-1 min-h-0 overflow-y-auto pr-2 pb-8 w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/projects" className="mt-1 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{project.name}</h1>
            {project.project_code && (
              <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">{project.project_code}</span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>
              {project.status?.replace("_", " ")}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyle}`}>
              {project.priority}
            </span>
          </div>
          {project.client_name && <p className="text-sm text-zinc-500 mt-0.5">Client: {project.client_name}</p>}
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Project Overview</h2>
        {project.description && <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{project.description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {project.start_date && (
            <InfoItem icon={<Calendar className="h-4 w-4" />} label="Start Date" value={new Date(project.start_date).toLocaleDateString("en-IN")} />
          )}
          {project.deadline && (
            <InfoItem icon={<Calendar className="h-4 w-4" />} label="Deadline" value={new Date(project.deadline).toLocaleDateString("en-IN")} />
          )}
          {isManagerOrAdmin && project.budget_usd && (
            <InfoItem icon={<DollarSign className="h-4 w-4" />} label="Budget" value={`$${project.budget_usd.toLocaleString()}`} />
          )}
          {isManagerOrAdmin && project.actual_cost && (
            <InfoItem icon={<DollarSign className="h-4 w-4" />} label="Actual Cost" value={`$${project.actual_cost.toLocaleString()}`} />
          )}
          {project.risk_level && (
            <InfoItem icon={<AlertTriangle className="h-4 w-4" />} label="Risk Level" value={project.risk_level} />
          )}
          {project.billing_type && (
            <InfoItem icon={<DollarSign className="h-4 w-4" />} label="Billing" value={project.billing_type?.replace(/_/g, " ")} />
          )}
        </div>

        {project.tech_stack && (
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400 mb-2">Technology Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.split(",").map((t: string) => (
                <span key={t} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md">{t.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {project.repo_url && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <GitBranch className="h-4 w-4" />
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">{project.repo_url}</a>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Team Members
            <span className="text-xs text-zinc-400 font-normal ml-1">({project.members?.length || 0})</span>
          </h2>
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" /> Assign Member
            </button>
          )}
        </div>

        {/* Assign Form */}
        {showAssign && (
          <div className="p-5 border-b bg-blue-50/50 dark:bg-blue-900/10">
            <form onSubmit={handleAssign} className="space-y-3">
              <h3 className="text-sm font-medium">Assign Employee to Project</h3>
              {assignError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{assignError}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select required value={assignForm.employee_id}
                  onChange={e => setAssignForm({...assignForm, employee_id: e.target.value})}
                  className="col-span-2 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation || "Employee"})</option>
                  ))}
                </select>
                <select value={assignForm.role_in_project}
                  onChange={e => setAssignForm({...assignForm, role_in_project: e.target.value})}
                  className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {PROJECT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input type="number" min="10" max="100" value={assignForm.allocation_percentage}
                  onChange={e => setAssignForm({...assignForm, allocation_percentage: e.target.value})}
                  placeholder="Allocation %"
                  className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAssign(false)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                <button type="submit" disabled={assigning}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members Table */}
        {!project.members?.length ? (
          <div className="text-center py-10 text-zinc-400 text-sm">No team members assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Employee</th>
                  <th className="px-5 py-3 text-left font-medium">Project Role</th>
                  <th className="px-5 py-3 text-left font-medium">Allocation</th>
                  <th className="px-5 py-3 text-left font-medium">Billable</th>
                  {isManagerOrAdmin && <th className="px-5 py-3 text-left font-medium">Action</th>}
                </tr>
              </thead>
              <tbody>
                {project.members?.map((m: any) => (
                  <tr key={m.id} className="border-t dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/dashboard/directory/${m.employee_id}`} className="hover:text-blue-600 hover:underline">
                        {m.employee_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{m.role_in_project}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m.allocation_percentage}%</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_billable ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {m.is_billable ? "Billable" : "Non-Billable"}
                      </span>
                    </td>
                    {isManagerOrAdmin && (
                      <td className="px-5 py-3">
                        <button onClick={() => handleRemoveMember(m.employee_id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {project.notes && isManagerOrAdmin && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">Internal Notes</p>
          <p className="text-sm text-amber-900 dark:text-amber-100">{project.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 flex items-center gap-1 mb-0.5">{icon}{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
