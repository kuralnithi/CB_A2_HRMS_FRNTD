import Link from "next/link";
import {
  FolderKanban, Calendar, Activity, CheckCircle2,
  Clock, ArrowUpRight, Ticket, Bot
} from "lucide-react";

interface Props { stats: any }

export default function EmployeeDashboard({ stats }: Props) {
  const s = stats || {};

  const kpis = [
    { label: "My Projects", value: s.my_projects ?? "-", icon: FolderKanban, color: "bg-blue-50 text-blue-600" },
    { label: "Ongoing", value: s.ongoing_projects ?? "-", icon: Activity, color: "bg-green-50 text-green-600" },
    { label: "Leave Balance", value: s.leave_balance ?? "-", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Leaves", value: s.pending_leaves ?? "-", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Open Tickets", value: s.open_tickets ?? "-", icon: Ticket, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Your personal workspace overview</p>
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
        {/* Personal Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">My Workspace</h3>
          <div className="space-y-2">
            {[
              { href: "/dashboard/projects", label: "View My Projects", icon: FolderKanban },
              { href: "/dashboard/leaves", label: "Request Leave", icon: Calendar },
              { href: "/dashboard/tickets", label: "Raise a Ticket", icon: Ticket },
              { href: "/dashboard/ai-copilot", label: "Ask AI Copilot", icon: Bot },
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
              Ask about HR policies, apply for leave, or raise tickets using natural language.
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
