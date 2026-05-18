import Link from "next/link";
import {
  Users, FolderKanban, Calendar, Activity,
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Ticket
} from "lucide-react";

interface Props { stats: any }

export default function ManagerDashboard({ stats }: Props) {
  const s = stats || {};

  const kpis = [
    { label: "Team Members", value: s.team_size ?? "-", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Projects", value: s.total_projects ?? "-", icon: FolderKanban, color: "bg-indigo-50 text-indigo-600" },
    { label: "Ongoing Projects", value: s.ongoing_projects ?? "-", icon: Activity, color: "bg-green-50 text-green-600" },
    { label: "Pending Leave Requests", value: s.pending_leaves ?? "-", icon: Calendar, color: "bg-amber-50 text-amber-600" },
    { label: "Open Tickets", value: s.open_tickets ?? "-", icon: Ticket, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Your team and project overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white dark:bg-zinc-900 rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-2 rounded-lg w-fit mb-3 ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/dashboard/leaves", label: "Review Leave Requests", icon: Calendar },
              { href: "/dashboard/directory", label: "View My Team", icon: Users },
              { href: "/dashboard/projects", label: "View Projects", icon: FolderKanban },
              { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Activity },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium">{a.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Copilot */}
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">AI Copilot</h3>
            <p className="text-blue-100 text-sm mt-1">
              Get instant answers about your team, projects, and HR policies.
            </p>
          </div>
          <Link href="/dashboard/ai-copilot" className="mt-4 w-fit flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Open Copilot <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
