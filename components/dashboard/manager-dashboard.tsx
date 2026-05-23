"use client";

import Link from "next/link";
import {
  Users, FolderKanban, Calendar, Activity,
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Ticket,
  Sparkles, Target, Zap
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";
import { useState } from "react";

interface Props { stats: any }

const mockTeamPerformance = [
  { name: 'Alice', completed: 12, ongoing: 3 },
  { name: 'Bob', completed: 8, ongoing: 5 },
  { name: 'Charlie', completed: 15, ongoing: 2 },
  { name: 'Diana', completed: 10, ongoing: 4 },
];

export default function ManagerDashboard({ stats }: Props) {
  const s = stats || {};
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const kpis = [
    { id: 'team', label: "Team Members", value: s.team_size ?? "-", icon: Users, gradient: "from-blue-500 to-indigo-600" },
    { id: 'projects', label: "Total Projects", value: s.total_projects ?? "-", icon: FolderKanban, gradient: "from-indigo-500 to-purple-600" },
    { id: 'ongoing', label: "Ongoing", value: s.ongoing_projects ?? "-", icon: Activity, gradient: "from-emerald-400 to-green-600" },
    { id: 'leaves', label: "Pending Leaves", value: s.pending_leaves ?? "-", icon: Calendar, gradient: "from-amber-400 to-orange-500" },
    { id: 'tickets', label: "Open Tickets", value: s.open_tickets ?? "-", icon: Ticket, gradient: "from-rose-400 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide mb-3">
            <Target className="w-3.5 h-3.5" />
            <span>Manager Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Team Overview
          </h1>
          <p className="text-zinc-500 mt-1 max-w-xl">
            Track your team's performance, manage projects, and handle approvals all in one place.
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
        
        {/* Team Performance Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Team Project Velocity
              </h3>
              <p className="text-xs text-zinc-500">Tasks completed vs ongoing per team member</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTeamPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]}>
                  {mockTeamPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorCompleted)" />
                  ))}
                </Bar>
                <Bar dataKey="ongoing" name="Ongoing" radius={[4, 4, 0, 0]}>
                  {mockTeamPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorOngoing)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <linearGradient id="colorOngoing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Quick Actions
          </h3>
          <div className="space-y-3 flex-1">
            {[
              { href: "/dashboard/leaves", label: "Review Leaves", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { href: "/dashboard/directory", label: "Manage Team", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { href: "/dashboard/projects", label: "View Projects", icon: FolderKanban, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
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
          <div className="mt-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white shadow-lg group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> AI Assistant
              </div>
              <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                Get instant answers about your team, projects, and HR policies.
              </p>
              <Link href="/dashboard/ai-copilot" className="mt-1 flex items-center gap-2 bg-white text-indigo-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-md">
                Launch Copilot <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
