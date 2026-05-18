"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase,
  Calendar, Clock, Star, FolderKanban, Lock
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:        "bg-green-100 text-green-700",
  BENCH:         "bg-amber-100 text-amber-700",
  NOTICE_PERIOD: "bg-red-100 text-red-700",
  RESIGNED:      "bg-zinc-100 text-zinc-500",
  ON_LEAVE:      "bg-blue-100 text-blue-700",
};

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as any)?.role || "EMPLOYEE";
  const token = (session?.user as any)?.accessToken;

  const [emp, setEmp] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [leaveSummary, setLeaveSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!token || !id) return;

    setLoading(true);
    setFetchError("");

    Promise.all([
      fetchApi(`/employees/${id}`, token),
      fetchApi(`/employees/${id}/projects`, token),
      fetchApi(`/employees/${id}/leave-summary`, token),
    ]).then(async ([er, pr, lr]) => {
      if (er.ok) setEmp(await er.json());
      else setFetchError(er.status === 404 ? "Employee not found" : `Error ${er.status}`);
      if (pr.ok) setProjects(await pr.json());
      if (lr.ok) setLeaveSummary(await lr.json());
    }).catch((e) => {
      console.error("profile fetch error:", e);
      setFetchError(e.message || "Cannot connect to the backend. Make sure the API server is running.");
    }).finally(() => setLoading(false));
  }, [id, token, sessionStatus]);

  if (sessionStatus === "loading" || loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
      <div className="h-8 bg-zinc-200 rounded w-36" />
      <div className="h-32 bg-zinc-100 rounded-xl" />
      <div className="h-48 bg-zinc-100 rounded-xl" />
    </div>
  );

  if (fetchError) return (
    <div className="text-center py-20 space-y-3">
      <User className="h-12 w-12 text-red-300 mx-auto" />
      <p className="text-zinc-600 font-medium">{fetchError}</p>
      <Link href="/dashboard/directory" className="text-blue-600 text-sm hover:underline">← Back to Directory</Link>
    </div>
  );

  if (!emp) return (
    <div className="text-center py-20">
      <User className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
      <p className="text-zinc-500">Employee not found</p>
      <Link href="/dashboard/directory" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to Directory</Link>
    </div>
  );

  const isAdmin = role === "ADMIN";
  const isManagerOrAdmin = role === "ADMIN" || role === "MANAGER";
  const statusStyle = STATUS_COLORS[emp.employment_status] || "bg-zinc-100 text-zinc-500";
  const initials = emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/dashboard/directory" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{emp.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle}`}>
                {emp.employment_status?.replace("_", " ")}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-0.5">{emp.designation || "—"}</p>
            {emp.department_name && <p className="text-xs text-zinc-400 mt-1">{emp.department_name}</p>}
          </div>
          {emp.employee_code && (
            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">{emp.employee_code}</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t">
          {emp.phone && <InfoItem icon={<Phone />} label="Phone" value={emp.phone} />}
          {emp.work_location && <InfoItem icon={<MapPin />} label="Location" value={emp.work_location} />}
          {emp.gender && <InfoItem icon={<User />} label="Gender" value={emp.gender} />}
          {emp.date_of_joining && <InfoItem icon={<Calendar />} label="Joined" value={new Date(emp.date_of_joining).toLocaleDateString("en-IN")} />}
          {emp.years_of_experience && <InfoItem icon={<Clock />} label="Experience" value={`${emp.years_of_experience} years`} />}
          {emp.manager_name && <InfoItem icon={<Briefcase />} label="Reports To" value={emp.manager_name} />}
        </div>
      </div>

      {/* Skills */}
      {emp.skills && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600" /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {emp.skills.split(",").map((s: string) => (
              <span key={s} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-blue-600" /> Assigned Projects
          </h2>
          <div className="space-y-2">
            {projects.map((p: any) => (
              <Link key={p.project_id} href={`/dashboard/projects/${p.project_id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div>
                  <p className="text-sm font-medium">{p.project_name}</p>
                  <p className="text-xs text-zinc-400">{p.role_in_project} · {p.allocation_percentage}%</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-400"}`}>
                  {p.is_active ? "Active" : "Past"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leave Summary */}
      {leaveSummary && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" /> Leave Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Requests", value: leaveSummary.total, color: "text-zinc-700" },
              { label: "Approved", value: leaveSummary.approved, color: "text-green-600" },
              { label: "Pending", value: leaveSummary.pending, color: "text-amber-600" },
              { label: "Remaining", value: leaveSummary.remaining, color: "text-blue-600" },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin-Only Section */}
      {isAdmin && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-500" /> Admin Information
            <span className="text-xs font-normal text-zinc-400">(Admin Only)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Current Salary (USD)</p>
              <p className="text-sm font-semibold">
                {emp.current_salary_usd ? `$${emp.current_salary_usd.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Allocation %</p>
              <p className="text-sm font-semibold">{emp.allocation_percentage ?? 100}%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Billable</p>
              <p className="text-sm font-semibold">{emp.is_billable ? "Yes" : "No"}</p>
            </div>
            {emp.notice_period_days && (
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">Notice Period</p>
                <p className="text-sm font-semibold">{emp.notice_period_days} days</p>
              </div>
            )}
          </div>
          {emp.hr_notes && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100">
              <p className="text-xs font-medium text-amber-600 mb-1">HR Notes</p>
              <p className="text-sm text-amber-900 dark:text-amber-200">{emp.hr_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 flex items-center gap-1 mb-0.5">
        <span className="h-3.5 w-3.5">{icon}</span>{label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
