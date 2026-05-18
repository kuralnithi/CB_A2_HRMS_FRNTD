import Link from "next/link";
import {
  Users, FolderKanban, Calendar, Clock, AlertTriangle,
  CheckCircle2, TrendingUp, Plus, UserPlus, Upload,
  BarChart3, Activity, Pause, XCircle, ArrowUpRight
} from "lucide-react";

interface Props { stats: any }

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DELAYED: "bg-red-100 text-red-700",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

export default function AdminDashboard({ stats }: Props) {
  const s = stats || {};

  const employeeKPIs = [
    { label: "Total Employees", value: s.total_employees ?? "-", icon: Users, color: "blue", sub: `${s.active_employees ?? 0} active` },
    { label: "On Bench", value: s.bench_employees ?? "-", icon: Clock, color: "amber", sub: "Unallocated" },
    { label: "Notice Period", value: s.notice_period_employees ?? "-", icon: AlertTriangle, color: "red", sub: "Attrition risk" },
  ];

  const projectKPIs = [
    { label: "Total Projects", value: s.total_projects ?? "-", icon: FolderKanban, color: "indigo" },
    { label: "Ongoing", value: s.ongoing_projects ?? "-", icon: Activity, color: "green" },
    { label: "Completed", value: s.completed_projects ?? "-", icon: CheckCircle2, color: "emerald" },
    { label: "Delayed", value: s.delayed_projects ?? "-", icon: AlertTriangle, color: "red" },
    { label: "On Hold", value: s.on_hold_projects ?? "-", icon: Pause, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Organization overview and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects/new" className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> New Project
          </Link>
          <Link href="/dashboard/directory/new" className="flex items-center gap-2 border border-zinc-300 text-sm px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">
            <UserPlus className="h-4 w-4" /> Add Employee
          </Link>
        </div>
      </div>

      {/* Employee KPIs */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Workforce</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {employeeKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white dark:bg-zinc-900 rounded-xl border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-2.5 rounded-lg ${colorMap[kpi.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{kpi.label}</p>
                  {kpi.sub && <p className="text-xs text-zinc-400 mt-0.5">{kpi.sub}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Project KPIs */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Project Portfolio</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {projectKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white dark:bg-zinc-900 rounded-xl border p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-2 rounded-lg w-fit ${colorMap[kpi.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-zinc-500">{kpi.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HR Metrics + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HR Metrics */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" /> HR Metrics
          </h3>
          <div className="space-y-4">
            <MetricRow label="Pending Leave Requests" value={s.pending_leaves ?? 0} max={20} color="amber" href="/dashboard/leaves" />
            <MetricRow label="Open IT Tickets" value={s.open_tickets ?? 0} max={20} color="red" href="/dashboard/tickets" />
            <MetricRow label="Announcements" value={s.total_announcements ?? 0} max={10} color="blue" href="/dashboard/ai-copilot" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { href: "/dashboard/projects/new", label: "Create New Project", icon: FolderKanban, color: "blue" },
              { href: "/dashboard/directory/new", label: "Add New Employee", icon: UserPlus, color: "green" },
              { href: "/dashboard/leaves", label: "Review Leave Requests", icon: Calendar, color: "amber" },
              { href: "/dashboard/ai-copilot", label: "Open AI Copilot", icon: BarChart3, color: "indigo" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${colorMap[action.color]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Copilot Card */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">NovaWorks AI Copilot</h3>
            <p className="text-blue-100 text-sm mt-1 max-w-md">
              Ask anything about HR policies, employee data, or automate HR tasks using natural language.
            </p>
          </div>
          <Link
            href="/dashboard/ai-copilot"
            className="flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Open Copilot <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, max, color, href }: { label: string; value: number; max: number; color: string; href: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColors: Record<string, string> = {
    amber: "bg-amber-500", red: "bg-red-500", blue: "bg-blue-500"
  };
  return (
    <Link href={href} className="block group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{label}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColors[color] || "bg-blue-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
