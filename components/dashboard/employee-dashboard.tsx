"use client";

import Link from "next/link";
import {
  FolderKanban, Calendar, Activity, CheckCircle2,
  Clock, ArrowUpRight, Ticket, Bot,
  Sparkles, Coffee, Code2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useState } from "react";

interface Props { stats: any }

const mockProductivity = [
  { day: 'Mon', tasks: 4, hours: 7.5 },
  { day: 'Tue', tasks: 6, hours: 8 },
  { day: 'Wed', tasks: 3, hours: 6.5 },
  { day: 'Thu', tasks: 7, hours: 8.5 },
  { day: 'Fri', tasks: 5, hours: 7 },
];

export default function EmployeeDashboard({ stats }: Props) {
  const s = stats || {};
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const kpis = [
    { id: 'projects', label: "My Projects", value: s.my_projects ?? "-", icon: FolderKanban, gradient: "from-blue-400 to-indigo-500" },
    { id: 'ongoing', label: "Ongoing Tasks", value: s.ongoing_projects ?? "-", icon: Activity, gradient: "from-emerald-400 to-teal-500" },
    { id: 'balance', label: "Leave Balance", value: s.leave_balance ?? "-", icon: Coffee, gradient: "from-amber-400 to-orange-500" },
    { id: 'pending', label: "Pending Leaves", value: s.pending_leaves ?? "-", icon: Clock, gradient: "from-purple-400 to-fuchsia-500" },
    { id: 'tickets', label: "Open Tickets", value: s.open_tickets ?? "-", icon: Ticket, gradient: "from-rose-400 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            My Workspace
          </h1>
          <p className="text-zinc-500 mt-1 max-w-xl">
            Welcome to your personal hub. Track your projects, request time off, and access HR services instantly.
          </p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isHovered = hoveredCard === kpi.id;
          return (
            <div 
              key={kpi.id} 
              onMouseEnter={() => setHoveredCard(kpi.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${kpi.gradient} blur-2xl group-hover:blur-3xl transition-all duration-500`} />
              
              <div className="flex flex-col gap-3 relative z-10">
                <div className={`p-2.5 rounded-xl w-fit bg-gradient-to-br ${kpi.gradient} text-white shadow-md`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">{kpi.value}</p>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">{kpi.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Weekly Productivity
              </h3>
              <p className="text-xs text-zinc-500">Tasks completed this week</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" name="Tasks Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-500" />
            Quick Actions
          </h3>
          <div className="space-y-3 flex-1">
            {[
              { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { href: "/dashboard/leaves", label: "Request Leave", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { href: "/dashboard/tickets", label: "Raise Ticket", icon: Ticket, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group bg-zinc-50/50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${a.bg} ${a.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{a.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </Link>
              );
            })}
          </div>

          {/* AI Copilot Mini Card */}
          <div className="mt-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 to-zinc-900 p-5 text-white shadow-lg group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-bold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" /> Nova Copilot
              </div>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                Need to check a policy or apply for leave? Just ask me!
              </p>
              <Link href="/dashboard/ai-copilot" className="mt-1 flex items-center gap-2 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]">
                Ask Copilot <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
