"use client";

import Link from "next/link";
import {
  Users, FolderKanban, Calendar, Clock, AlertTriangle,
  CheckCircle2, TrendingUp, Plus, UserPlus, Upload,
  BarChart3, Activity, Pause, XCircle, ArrowUpRight,
  Sparkles, Briefcase, ChevronRight, Maximize2, Minimize2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useState } from "react";

interface Props { stats: any }

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockTrendData = [
  { name: 'Jan', employees: 120, projects: 12 },
  { name: 'Feb', employees: 125, projects: 15 },
  { name: 'Mar', employees: 132, projects: 14 },
  { name: 'Apr', employees: 145, projects: 18 },
  { name: 'May', employees: 150, projects: 22 },
  { name: 'Jun', employees: 165, projects: 25 },
];

export default function AdminDashboard({ stats }: Props) {
  const s = stats || {};
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isTrendFullscreen, setIsTrendFullscreen] = useState(false);
  const [isPortfolioFullscreen, setIsPortfolioFullscreen] = useState(false);

  const employeeKPIs = [
    { id: 'total', label: "Total Employees", value: s.total_employees ?? "-", icon: Users, gradient: "from-blue-500 to-indigo-600", sub: `${s.active_employees ?? 0} active` },
    { id: 'bench', label: "On Bench", value: s.bench_employees ?? "-", icon: Clock, gradient: "from-amber-400 to-orange-500", sub: "Unallocated resources" },
    { id: 'notice', label: "Notice Period", value: s.notice_period_employees ?? "-", icon: AlertTriangle, gradient: "from-rose-400 to-red-600", sub: "Attrition risk" },
  ];

  const projectStatusData = [
    { name: 'Ongoing', value: s.ongoing_projects ?? 0, color: '#10b981' },
    { name: 'Completed', value: s.completed_projects ?? 0, color: '#3b82f6' },
    { name: 'Delayed', value: s.delayed_projects ?? 0, color: '#ef4444' },
    { name: 'On Hold', value: s.on_hold_projects ?? 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // If no project data, provide some default for visual
  const chartData = projectStatusData.length > 0 ? projectStatusData : [
    { name: 'Ongoing', value: 12, color: '#10b981' },
    { name: 'Completed', value: 25, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div data-robot-anchor="true" className="relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm relative overflow-hidden group z-10">
        <div className="absolute -right-6 -bottom-10 opacity-[0.03] dark:opacity-[0.06] text-zinc-900 dark:text-white pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
          <Sparkles className="w-56 h-56" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Overview Dashboard
          </h1>
          <p className="text-zinc-500 mt-1 max-w-xl">
            Here's what's happening across your organization today. Monitor workforce health, project trajectories, and core HR metrics in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/projects/new" className="group flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-md hover:shadow-xl">
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> New Project
          </Link>
          <Link href="/dashboard/directory/new" className="group flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all hover:shadow-md">
            <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" /> Add Employee
          </Link>
        </div>
      </div>
      </div>

      {/* Primary KPIs */}
      <div data-robot-anchor="true" className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {employeeKPIs.map((kpi) => {
            const Icon = kpi.icon;
            const isHovered = hoveredCard === kpi.id;
            return (
              <div 
                key={kpi.id} 
                onMouseEnter={() => setHoveredCard(kpi.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group z-10"
              >
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${kpi.gradient} blur-2xl group-hover:blur-3xl transition-all duration-500`} />
                
                {/* Suitcase background-like Icon */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] text-zinc-900 dark:text-white pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  <Icon className="w-28 h-28" />
                </div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isHovered && (
                    <span className="text-xs font-medium text-zinc-400 animate-in fade-in slide-in-from-right-2">View details</span>
                  )}
                </div>
                
                <div className="relative z-10">
                  <p className="text-3xl font-black tracking-tight">{kpi.value}</p>
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-1">{kpi.label}</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-2 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${kpi.gradient}`} />
                    {kpi.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (Spans 2 columns) */}
        <div data-robot-anchor="true" className={`relative ${
          isTrendFullscreen 
            ? "fixed inset-0 z-[100] p-8 w-screen h-screen bg-white dark:bg-zinc-950" 
            : "lg:col-span-2"
        }`}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col transition-all duration-300 relative overflow-hidden group rounded-2xl p-6 h-full z-10">
          {!isTrendFullscreen && (
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05] text-zinc-900 dark:text-white pointer-events-none transition-transform duration-500 group-hover:scale-105">
              <TrendingUp className="w-56 h-56" />
            </div>
          )}
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Growth Trajectory
              </h3>
              <p className="text-xs text-zinc-500">Employee and Project growth over the last 6 months</p>
            </div>
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsTrendFullscreen(!isTrendFullscreen)}
              className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border dark:border-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900 flex-shrink-0"
              title={isTrendFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
              {isTrendFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          
          <div className={`flex-1 w-full ${isTrendFullscreen ? "min-h-0" : "min-h-[250px]"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="employees" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmp)" name="Employees" />
                <Area type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProj)" name="Projects" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>

        {/* Project Status Donut Chart */}
        <div data-robot-anchor="true" className={`relative ${
          isPortfolioFullscreen
            ? "fixed inset-0 z-[100] p-8 w-screen h-screen bg-white dark:bg-zinc-950"
            : ""
        }`}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 rounded-2xl p-6 h-full z-10">
          {!isPortfolioFullscreen && (
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Briefcase className="w-32 h-32" />
            </div>
          )}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-500" />
                Project Portfolio
              </h3>
              <p className="text-xs text-zinc-500">Current status distribution</p>
            </div>
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsPortfolioFullscreen(!isPortfolioFullscreen)}
              className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border dark:border-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900 flex-shrink-0"
              title={isPortfolioFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
              {isPortfolioFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          
          <div className={`flex-1 w-full mt-4 relative ${isPortfolioFullscreen ? "min-h-0" : "min-h-[200px]"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">{s.total_projects ?? 0}</span>
              <span className="text-xs font-semibold text-zinc-500">Total</span>
            </div>
          </div>
          
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {chartData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                <span className="ml-auto font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Section: Metrics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HR Metrics - Redesigned as modern bars */}
        <div data-robot-anchor="true" className="relative">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden group h-full z-10">
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] text-zinc-900 dark:text-white pointer-events-none transition-transform duration-500 group-hover:scale-105">
            <Activity className="w-40 h-40" />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-500" /> Action Required
            </h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-md">Urgent</span>
          </div>
          
          <div className="space-y-5">
            <MetricBar label="Pending Leave Requests" value={s.pending_leaves ?? 0} max={20} color="from-amber-400 to-orange-500" icon={Calendar} href="/dashboard/leaves" />
            <MetricBar label="Open IT Tickets" value={s.open_tickets ?? 0} max={20} color="from-rose-400 to-red-500" icon={AlertTriangle} href="/dashboard/tickets" />
            <MetricBar label="New Announcements" value={s.total_announcements ?? 0} max={10} color="from-blue-400 to-indigo-500" icon={BarChart3} href="/dashboard/ai-copilot" />
          </div>
          </div>
        </div>

        {/* AI Copilot - Premium Card */}
        <div data-robot-anchor="true" className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-zinc-900 p-1 shadow-xl h-full z-10">
            {/* Animated background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-pulse delay-1000" />
          
          <div className="relative h-full bg-zinc-950/40 backdrop-blur-xl rounded-xl p-8 flex flex-col justify-between border border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" /> AI Assistant Active
              </div>
              <h3 className="text-3xl font-black text-white mb-3">NovaWorks Copilot</h3>
              <p className="text-blue-100/80 text-sm leading-relaxed max-w-sm">
                Unleash the power of AI. Ask complex queries about HR policies, generate reports instantly, and resolve employee requests with natural language.
              </p>
            </div>
            
            <div className="mt-8">
              <Link
                href="/dashboard/ai-copilot"
                className="group inline-flex items-center gap-3 bg-white text-zinc-900 font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Launch Workspace 
                <div className="bg-zinc-100 rounded-lg p-1 group-hover:bg-zinc-200 transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
}

function MetricBar({ label, value, max, color, icon: Icon, href }: { label: string; value: number; max: number; color: string; icon: any; href: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Link href={href} className="group block relative p-3 -mx-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{label}</span>
        </div>
        <span className="text-sm font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{value}</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${color}`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </Link>
  );
}

