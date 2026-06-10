"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, FileText, Database, Zap, AlertCircle,
  Eye, EyeOff, Terminal, Shield, Users, BarChart3, Calendar,
  Briefcase, Download, ChevronRight, Sparkles,
  Maximize2, Minimize2, X, ShieldAlert, MessageSquarePlus, Layout, Table as TableIcon,
  PanelLeftClose, PanelLeftOpen, Expand
} from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatSidebar } from "./chat-sidebar";
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sources?: any[];
  sql?: string;
  rows?: any[];
  actionResult?: any;
  devMetadata?: any;
};

type ChatSessionType = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
};

// ─── Role-Specific Suggested Prompts ─────────────────────────────────────────
const SUGGESTED_PROMPTS: Record<string, { label: string; prompt: string; icon: any; color: string }[]> = {
  ADMIN: [
    { label: "All Employees", prompt: "Show all employees with their department and status", icon: Users, color: "blue" },
    { label: "Payroll Summary", prompt: "What is the total payroll cost by department?", icon: BarChart3, color: "emerald" },
    { label: "Pending Leaves", prompt: "List all pending leave requests awaiting approval", icon: Calendar, color: "amber" },
    { label: "Open Tickets", prompt: "Show all open IT support tickets", icon: AlertCircle, color: "rose" },
    { label: "Projects Status", prompt: "Give me a summary of all ongoing and delayed projects", icon: Briefcase, color: "indigo" },
    { label: "Notice Period", prompt: "Who are the employees currently in notice period?", icon: Shield, color: "orange" },
  ],
  MANAGER: [
    { label: "My Team", prompt: "Show all employees in my team", icon: Users, color: "blue" },
    { label: "Team Leaves", prompt: "Show pending leave requests from my team", icon: Calendar, color: "amber" },
    { label: "Project Updates", prompt: "What projects are my team members working on?", icon: Briefcase, color: "indigo" },
    { label: "Leave Policy", prompt: "What is the leave encashment policy?", icon: FileText, color: "purple" },
    { label: "Approve Leave", prompt: "Approve Rahul's leave request", icon: Zap, color: "emerald" },
    { label: "Team Skills", prompt: "List all skills available in my team", icon: BarChart3, color: "teal" },
  ],
  EMPLOYEE: [
    { label: "My Leaves", prompt: "How many leaves do I have remaining?", icon: Calendar, color: "blue" },
    { label: "Apply Leave", prompt: "Apply sick leave for tomorrow", icon: Zap, color: "emerald" },
    { label: "Leave Policy", prompt: "What is the maternity leave policy?", icon: FileText, color: "purple" },
    { label: "WFH Policy", prompt: "Can I work from home? What are the rules?", icon: Shield, color: "indigo" },
    { label: "Raise Ticket", prompt: "Create a ticket for laptop battery replacement", icon: AlertCircle, color: "rose" },
    { label: "My Projects", prompt: "Which projects am I currently assigned to?", icon: Briefcase, color: "amber" },
  ],
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950/20",    text: "text-blue-700 dark:text-blue-300",    border: "border-blue-200 dark:border-blue-800",   hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-950/40" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-950/40" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/20",   text: "text-amber-700 dark:text-amber-300",   border: "border-amber-200 dark:border-amber-800",   hoverBg: "hover:bg-amber-100 dark:hover:bg-amber-950/40" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/20",     text: "text-rose-700 dark:text-rose-300",     border: "border-rose-200 dark:border-rose-800",     hoverBg: "hover:bg-rose-100 dark:hover:bg-rose-950/40" },
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800", hoverBg: "hover:bg-indigo-100 dark:hover:bg-indigo-950/40" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800", hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-950/40" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800", hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-950/40" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-950/20",     text: "text-teal-700 dark:text-teal-300",     border: "border-teal-200 dark:border-teal-800",     hoverBg: "hover:bg-teal-100 dark:hover:bg-teal-950/40" },
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(rows: any[], filename = "export.csv") {
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const body = rows.map(r => cols.map(c => `"${String(r[c]).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Smart Table Renderer ─────────────────────────────────────────────────────
function TableContent({
  rows,
  columns,
  page,
  pageSize,
  totalPages,
  setPage,
  isFullscreen,
  onExport,
}: {
  rows: any[];
  columns: string[];
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (fn: (p: number) => number) => void;
  isFullscreen: boolean;
  onExport?: () => void;
}) {
  const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div className={`flex flex-col ${isFullscreen ? "flex-1 min-h-0" : ""}`}>
      {/* Scrollable table area */}
      <div className={`overflow-x-auto overflow-y-auto ${isFullscreen ? "flex-1 min-h-0" : "max-h-[320px]"}`}>
        <table className={`w-full text-left ${isFullscreen ? "text-sm" : "text-xs"}`}>
          <thead className="bg-zinc-50 dark:bg-zinc-800/30 sticky top-0 z-10">
            <tr>
              {columns.map(col => (
                <th key={col} className={`font-semibold text-zinc-600 dark:text-zinc-400 capitalize whitespace-nowrap border-b border-zinc-200 dark:border-zinc-800 ${isFullscreen ? "px-5 py-3" : "px-3 py-2"}`}>
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                {columns.map(col => (
                  <td key={col} className={`text-zinc-700 dark:text-zinc-300 whitespace-nowrap ${isFullscreen ? "px-5 py-3" : "px-3 py-2"}`}>
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer — pagination and actions */}
      {(totalPages > 1 || onExport) && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          {totalPages > 1 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
              >← Prev</button>
              <span className="text-[11px] text-zinc-500 font-medium">Page {page + 1} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
              >Next →</button>
            </div>
          ) : <div />}
          
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SmartTable({ rows, title }: { rows: any[]; title?: string }) {
  const [page, setPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageSize = isFullscreen ? 20 : 8;
  const columns = Object.keys(rows[0]);
  const totalPages = Math.ceil(rows.length / pageSize);

  // Close fullscreen on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    if (isFullscreen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const toolbar = (
    <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          {title ? title : <>{rows.length} result{rows.length !== 1 ? "s" : ""}</>}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => { setIsFullscreen(f => !f); setPage(0); }}
          className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Expand fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // Fullscreen via Portal
  if (isFullscreen) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0">
              <div className="flex items-center gap-3 max-w-[75%]">
                <Database className="h-5 w-5 text-white/80 shrink-0" />
                <span className="text-sm font-semibold text-white leading-snug">{title || "Query Results"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Fullscreen Table Body — flex-1 so it fills remaining height and scrolls */}
            <TableContent
              rows={rows}
              columns={columns}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              setPage={setPage}
              isFullscreen={true}
              onExport={() => exportToCSV(rows)}
            />
          </div>
        </div>
      </Portal>
    );
  }

  // Inline (normal) view
  return (
    <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {toolbar}
      <TableContent
        rows={rows}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        setPage={setPage}
        isFullscreen={false}
        onExport={() => exportToCSV(rows)}
      />
    </div>
  );
}

// ─── Metric Card (for single-value SQL results) ───────────────────────────────
function MetricCards({ rows }: { rows: any[] }) {
  if (rows.length !== 1) return null;
  const entry = rows[0];
  const keys = Object.keys(entry);
  if (keys.length > 4) return null; // Only show as cards if few columns

  return (
    <div className={`mt-2 grid gap-2 ${keys.length === 1 ? "grid-cols-1" : keys.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
      {keys.map(k => (
        <div key={k} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-xs font-medium text-zinc-500 capitalize mb-1">{k.replace(/_/g, " ")}</p>
          <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{String(entry[k])}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Extract first meaningful sentence from AI response ──────────────────────
function extractCaption(text: string): string {
  // Prefer the first line if it ends with ':' (intro lines like "The total payroll cost... is as follows:")
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const introLine = lines.find(l => l.endsWith(":"));
  if (introLine && introLine.length < 200) return introLine;
  // Fallback: first sentence up to a '.'
  const sentenceMatch = text.match(/^[^.\n]{10,200}\./);
  if (sentenceMatch) return sentenceMatch[0].trim();
  // Last resort: first line
  return lines[0]?.slice(0, 150) ?? "Results";
}

// ─── Smart title derived from column names (fallback when no caption) ─────────
function deriveTableTitle(columns: string[]): string {
  const c = columns.map(x => x.toLowerCase());
  const has = (...keys: string[]) => keys.some(k => c.some(col => col.includes(k)));

  if (has("payroll", "salary", "total_cost", "total_payroll")) return "Payroll Summary";
  if (has("leave_type", "leave_status") || (has("leave") && has("start_date"))) return "Leave Requests";
  if (has("ticket", "issue", "priority") && has("status")) return "IT Support Tickets";
  if (has("project") && has("status")) return "Project Status";
  if (has("project") && has("name")) return "Project Assignments";
  if (has("skill")) return "Skills Overview";
  if (has("attendance", "check_in", "check_out")) return "Attendance Records";
  if (has("announcement", "title") && has("created")) return "Announcements";
  if (has("notice") || (has("employment_status") && c.some(col => col === "employment_status"))) return "Employee Status";
  if (has("department") && !has("name")) return "Department Summary";
  if (has("department") && has("name")) return "Employee Directory";
  if (has("name") && has("email")) return "Employee List";
  if (has("name") && has("status")) return "Employee Status";
  if (has("name")) return "Results";
  return "Query Results";
}

// ─── Analytics Dashboard & Database Details ─────────────────────────────────
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function AnalyticsDashboard({ rows, sql, caption, devMetadata, isExpanded: controlledIsExpanded, onToggleExpanded }: { rows?: any[]; sql?: string; caption?: string; devMetadata?: any; isExpanded?: boolean; onToggleExpanded?: (val: boolean) => void }) {
  const [sqlOpen, setSqlOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "chart" | "split">(
    (devMetadata?.response_type === "chart_table" && rows && rows.length > 1) ? "split" : "table"
  );
  const [selectedChartType, setSelectedChartType] = useState<"bar" | "horizontal_bar" | "line" | "area" | "pie" | null>(null);
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : localIsExpanded;
  const setIsExpanded = onToggleExpanded || setLocalIsExpanded;

  if ((!rows || rows.length === 0) && !sql) return null;

  const hasRows = rows && rows.length > 0;
  const columns = hasRows ? Object.keys(rows![0]) : [];
  const title = caption || (hasRows ? deriveTableTitle(columns) : "Query Results");
  
  // ─── Client-Side Chartability & Metadata Fallback ─────────────────────────
  let responseType = devMetadata?.response_type || "table";
  let chartMeta = devMetadata?.chart;
  let analytics = devMetadata?.analytics;

  // Force suppress charts and analytics for single-row results, ensuring old saved metadata is overridden
  if (rows && rows.length <= 1) {
    responseType = "table";
    chartMeta = null;
    analytics = null;
  }

  let numericColumns: string[] = [];
  let categoricalColumns: string[] = [];
  
  if (hasRows) {
    const excludeSubstrings = ["id", "uuid", "phone", "email", "hash", "password", "url", "description", "details", "photo", "mime"];
    const allKeys = Object.keys(rows![0]);
    const validKeys = allKeys.filter(k => !excludeSubstrings.some(sub => k.toLowerCase().includes(sub)));
    
    validKeys.forEach(k => {
      let isNumeric = true;
      let hasValue = false;
      for (let i = 0; i < Math.min(rows!.length, 5); i++) {
        const val = rows![i][k];
        if (val !== undefined && val !== null) {
          hasValue = true;
          const parsed = parseFloat(val);
          if (typeof val !== 'number' && isNaN(parsed)) {
            isNumeric = false;
            break;
          }
        }
      }
      if (hasValue) {
        if (isNumeric) {
          numericColumns.push(k);
        } else {
          categoricalColumns.push(k);
        }
      }
    });

    if (categoricalColumns.length === 0) {
      const allKeys = Object.keys(rows![0]);
      categoricalColumns = allKeys.filter(k => !numericColumns.includes(k) && k.toLowerCase() !== 'id');
    }
  }

  // Calculate default analytics if missing
  if (hasRows && rows!.length > 1 && numericColumns.length > 0 && (!analytics || Object.keys(analytics).length === 0)) {
    const primaryNum = numericColumns[0];
    const values = rows!.map(r => {
      const val = r[primaryNum];
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }).filter(val => val !== null) as number[];

    if (values.length > 0) {
      const total = values.reduce((sum, v) => sum + v, 0);
      const avg = total / values.length;
      analytics = {
        total: parseFloat(total.toFixed(2)),
        average: parseFloat(avg.toFixed(2)),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        metric_key: primaryNum
      };
    }
  }

  // Fallback chartMeta if missing but we have rows and numeric columns
  const clientChartable = hasRows && rows!.length > 1 && numericColumns.length > 0 && (categoricalColumns.length > 0 || Object.keys(rows![0]).length > 1);

  if (clientChartable && !chartMeta) {
    const xKey = categoricalColumns[0] || Object.keys(rows![0]).find(k => k !== numericColumns[0] && k.toLowerCase() !== 'id') || Object.keys(rows![0])[0];
    const yKey = numericColumns[0];
    let defaultType: "bar" | "line" | "pie" | "area" | "horizontal_bar" = "bar";
    
    if (xKey.toLowerCase().includes('date') || xKey.toLowerCase().includes('time') || xKey.toLowerCase().includes('month') || xKey.toLowerCase().includes('year')) {
      defaultType = "line";
    } else if (rows!.length <= 6) {
      defaultType = "pie";
    } else {
      const avgLen = rows!.reduce((sum, r) => sum + String(r[xKey] || '').length, 0) / rows!.length;
      if (avgLen > 15) {
        defaultType = "horizontal_bar";
      }
    }
    
    chartMeta = {
      type: defaultType,
      x_key: xKey,
      y_key: yKey
    };
  }

  const isChartable = (responseType === "chart_table" || clientChartable) && chartMeta && hasRows;
  const currentChartType = selectedChartType || chartMeta?.type || "bar";

  // If chart isn't supported, force viewMode to table
  useEffect(() => {
    if (!isChartable && viewMode !== "table") {
      setViewMode("table");
    }
  }, [isChartable, viewMode]);

  const renderChart = (chartHeight: number = 300) => {
    if (!isChartable) return null;

    // Convert values to float for charting if they are string numbers
    const chartData = rows!.map(row => {
      const newRow = { ...row };
      if (typeof newRow[chartMeta.y_key] !== 'number') {
        const parsed = parseFloat(newRow[chartMeta.y_key]);
        if (!isNaN(parsed)) {
          newRow[chartMeta.y_key] = parsed;
        }
      }
      return newRow;
    });
    
    if (currentChartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={chartMeta.y_key}
              nameKey={chartMeta.x_key}
              label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '15px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    let ChartComponent: any = BarChart;
    let SeriesComponent: any = Bar;
    
    if (currentChartType === "line") {
      ChartComponent = LineChart;
      SeriesComponent = Line;
    } else if (currentChartType === "area") {
      ChartComponent = AreaChart;
      SeriesComponent = Area;
    } else if (currentChartType === "horizontal_bar") {
      ChartComponent = BarChart;
      SeriesComponent = Bar;
    }
    
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ChartComponent data={chartData} layout={currentChartType === "horizontal_bar" ? "vertical" : "horizontal"} margin={{ top: 30, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          {currentChartType === "horizontal_bar" ? (
            <>
              <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey={chartMeta.x_key} type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={chartMeta.x_key} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            </>
          )}
          <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <SeriesComponent 
            dataKey={chartMeta.y_key} 
            fill="#3b82f6" 
            stroke="#2563eb"
            radius={currentChartType.includes('bar') ? [4, 4, 0, 0] : 0}
            strokeWidth={2}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full mt-2 space-y-3">
      {!isExpanded && hasRows && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-[13px] font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 py-2.5 px-4 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <Database className="h-4 w-4 text-blue-500" />
          View Data Details
        </button>
      )}

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {caption && (
            <p className="text-[13px] text-zinc-700 dark:text-zinc-300 px-1 leading-relaxed">
              {caption}
            </p>
          )}

          {/* Metric Cards */}
      {analytics && Object.keys(analytics).length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {['total', 'average', 'max', 'count'].map(k => (
            analytics[k] !== undefined && (
              <div key={k} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-1 duration-250">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{k}</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {k === 'count' ? analytics[k] : 
                   (typeof analytics[k] === 'number' && analytics[k] > 1000 ? 
                    (analytics[k] / 1000).toFixed(1) + 'k' : analytics[k])}
                </span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Visualization Area */}
      {hasRows && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">{title}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isChartable && (
                <div className="flex flex-wrap items-center gap-3">
                {/* Chart Type Selector */}
                {(viewMode === 'chart' || viewMode === 'split') && (
                  <div className="flex bg-zinc-200/80 dark:bg-zinc-950 rounded-xl p-1 border border-zinc-300/40 dark:border-zinc-850 shadow-xs mr-2 animate-in fade-in zoom-in-95 duration-200 items-center">
                    {(["bar", "horizontal_bar", "line", "area", "pie"] as const).map(type => {
                      const labels: Record<string, string> = {
                        bar: "Bar",
                        horizontal_bar: "H-Bar",
                        line: "Line",
                        area: "Area",
                        pie: "Pie"
                      };
                      return (
                        <button 
                          key={type}
                          onClick={() => setSelectedChartType(type)} 
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${currentChartType === type ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                          title={`${labels[type]} Chart`}
                        >
                          {labels[type]}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* View Switcher */}
                <div className="flex bg-zinc-200/80 dark:bg-zinc-950 rounded-xl p-1 border border-zinc-300/40 dark:border-zinc-850 shadow-xs items-center">
                  <button onClick={() => setViewMode("table")} className={`px-3 py-1 flex items-center rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><TableIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500"/>Table</button>
                  <button onClick={() => setViewMode("chart")} className={`px-3 py-1 flex items-center rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${viewMode === 'chart' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><BarChart3 className="h-3.5 w-3.5 mr-1.5 text-indigo-500"/>Chart</button>
                  <button onClick={() => setViewMode("split")} className={`px-3 py-1 flex items-center rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${viewMode === 'split' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><Layout className="h-3.5 w-3.5 mr-1.5 text-purple-500"/>Split</button>
                </div>

                {/* Chart Fullscreen Icon Button (Highly Visible in Toolbar!) */}
                <button
                  type="button"
                  onClick={() => setChartFullscreen(true)}
                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  title="Expand chart fullscreen"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
          
          <div className={`p-4 pb-8 flex flex-col md:flex-row gap-4 ${viewMode === 'split' ? 'items-start' : ''}`}>
            {(viewMode === 'chart' || viewMode === 'split') && isChartable && (
              <div className={`relative group/chart ${viewMode === 'split' ? 'w-full md:w-1/2 animate-in fade-in zoom-in-95 duration-200' : 'w-full animate-in fade-in zoom-in-95 duration-200'}`}>
                {/* Chart Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setChartFullscreen(true)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer backdrop-blur-sm"
                  title="Expand chart fullscreen"
                >
                  <Expand className="h-3.5 w-3.5" />
                </button>
                {renderChart()}
              </div>
            )}
            {(viewMode === 'table' || viewMode === 'split' || !isChartable) && (
              <div className={`${viewMode === 'split' && isChartable ? 'w-full md:w-1/2 overflow-hidden animate-in fade-in duration-200' : 'w-full animate-in fade-in duration-200'}`}>
                <SmartTable rows={rows!} />
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      )}

      {/* Chart Fullscreen Portal */}
      {chartFullscreen && isChartable && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Fullscreen Chart Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-400 shrink-0" />
                <div>
                  <span className="text-base font-bold text-white leading-tight">{title}</span>
                  <span className="text-xs text-zinc-400 font-mono ml-3">{rows!.length} rows</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Fullscreen Chart Type Selector */}
                <div className="flex bg-white/10 rounded-xl p-1 border border-white/5 shadow-inner">
                  {(["bar", "horizontal_bar", "line", "area", "pie"] as const).map(type => {
                    const labels: Record<string, string> = {
                      bar: "Bar", horizontal_bar: "H-Bar", line: "Line", area: "Area", pie: "Pie"
                    };
                    return (
                      <button 
                        key={type}
                        onClick={() => setSelectedChartType(type)} 
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${currentChartType === type ? 'bg-white text-blue-600 shadow-sm scale-105 font-extrabold' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                      >
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setChartFullscreen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 border border-white/10"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                  <span className="text-xs font-semibold">Exit Fullscreen</span>
                </button>
              </div>
            </div>
            
            {/* Fullscreen Chart Body */}
            <div className="flex-1 w-full p-8 md:p-12 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center min-h-0 overflow-y-auto">
              <div className="w-full max-w-7xl h-full flex flex-col justify-center items-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200">
                {renderChart(550)}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* SQL — collapsible, for admin/manager */}
      {sql && (
        <div>
          <button
            type="button"
            onClick={() => setSqlOpen(o => !o)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors select-none cursor-pointer"
          >
            {sqlOpen
              ? <><EyeOff className="h-3 w-3" /> Hide SQL</>
              : <><Eye className="h-3 w-3" /> View SQL</>}
          </button>
          {sqlOpen && (
            <div className="mt-1 text-xs font-mono bg-zinc-950 text-zinc-200 p-3 rounded-lg border border-zinc-800 overflow-x-auto shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="whitespace-pre overflow-x-auto">{sql}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dev Metadata Block ───────────────────────────────────────────────────────
function DevMetadataBlock({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="mt-2 w-full text-[10px] font-mono bg-zinc-950 text-emerald-400 p-2.5 rounded-md border border-zinc-800 shadow-inner overflow-hidden flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-0.5">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Terminal className="h-3 w-3" />
          Developer Telemetry
        </span>
        <span className={data.source?.includes("HIT") ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
          {data.latency_ms}ms
        </span>
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1">
        <span className="text-zinc-500">Source</span>
        <span className="truncate" title={data.source}>{data.source}</span>
        <span className="text-zinc-500">Routing</span>
        <span className="truncate">{data.agent} ({(data.confidence * 100).toFixed(1)}%)</span>
        <span className="text-zinc-500">Cache Key</span>
        <span className="truncate opacity-80" title={data.cache_key}>{data.cache_key || "N/A"}</span>
      </div>
    </div>
  );
}

// ─── Suggested Prompt Chips ───────────────────────────────────────────────────
function SuggestedPrompts({ role, onSelect }: { role: string; onSelect: (p: string) => void }) {
  const prompts = SUGGESTED_PROMPTS[role] || SUGGESTED_PROMPTS["EMPLOYEE"];
  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Try asking...
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => {
          const Icon = p.icon;
          const c = COLOR_MAP[p.color] || COLOR_MAP.blue;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onSelect(p.prompt)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer ${c.bg} ${c.text} ${c.border} ${c.hoverBg}`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {p.label}
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Chat Panel ──────────────────────────────────────────────────────────
export default function ChatPanel({ user }: { user: any }) {
  const role: string = user?.role || "EMPLOYEE";
  const [devMode, setDevMode] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSessionType[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi **${user.email?.split("@")[0] ?? "there"}**! I'm the NovaWorks PeopleOps Copilot.\n\nI can help you with HR policies, employee data queries, and automated HR actions. Pick a quick prompt below or type your own question.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expandedDashboards, setExpandedDashboards] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (input === "" && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [input]);

  const fetchSessions = async (excludeId?: string) => {
    try {
      const idToExclude = excludeId || activeSessionId || undefined;
      const url = idToExclude
        ? `${process.env.NEXT_PUBLIC_API_URL}/chat/sessions?exclude_session_id=${idToExclude}`
        : `${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        console.error("Failed to fetch sessions, status:", res.status);
      }
    } catch (e) {
      console.error("Failed to fetch sessions error", e);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSessionId(id);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id.toString(),
            role: m.role,
            content: m.content,
            intent: m.intent,
            sources: m.sources,
            sql: m.sql,
            rows: m.rows,
            actionResult: m.action_result,
            devMetadata: m.dev_metadata
          })));
          setShowSuggestions(false);
        } else {
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setLoading(false);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        await fetchSessions(data.id);
        setActiveSessionId(data.id);
        handleNewConversation();
        if (isMobile) setIsSidebarOpen(false);
      }
    } catch (e) {
      console.error("Failed to create session", e);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        await fetchSessions();
        if (activeSessionId === id) {
          setActiveSessionId(null);
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch initial sessions
  useEffect(() => {
    if (user?.accessToken) {
      fetchSessions();
    }
  }, [user]);

  // Escape key exits chat fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsChatFullscreen(false); };
    if (isChatFullscreen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isChatFullscreen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    setShowSuggestions(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let currentSessionId = activeSessionId;
      // If no active session, create one
      if (!currentSessionId) {
        const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.accessToken}` }
        });
        if (createRes.ok) {
          const data = await createRes.json();
          currentSessionId = data.id;
          setActiveSessionId(data.id);
          
          // Optimistically update sidebar list
          setSessions(prev => {
            const exists = prev.find(s => s.id === data.id);
            if (exists) return prev;
            return [{
              id: data.id,
              title: data.title || "New Conversation",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, ...prev];
          });
          
          await fetchSessions(data.id);
        }
      }

      const historyPayload = messages
        .filter(m => m.id !== "welcome")
        .map(m => {
          const entry: { role: string; content: string; rows?: any[] } = { role: m.role, content: m.content };
          // Include rows so the backend can extract IDs (e.g., leave ID) from previous data queries
          if (m.rows && m.rows.length > 0) {
            entry.content = m.content + `\n\n[Data results: ${JSON.stringify(m.rows)}]`;
          }
          return entry;
        });

      // Flow: chat-panel.tsx handleSend() → POST /chat/router
      //       → file:///c:/Users/kural/Downloads/capstone_project_assignments/ai_hr_copilot/backend/app/api/v1/endpoints/chat.py#L392 route_chat()
      //       → file:///c:/Users/kural/Downloads/capstone_project_assignments/ai_hr_copilot/backend/app/services/ai/router.py#L227 route_query()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ 
          message: text, 
          history: historyPayload,
          session_id: currentSessionId 
        })
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();

      const payload = json.data || {};
      const inner = payload.data || {};

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: inner.answer || payload.answer || (json.success === false ? (json.error || "I encountered an error.") : "I encountered an error processing your request."),
        intent: payload.intent,
        sources: inner.sources,
        sql: inner.sql,
        rows: inner.rows,
        actionResult: inner.result,
        devMetadata: payload.dev_metadata
      };

      setMessages(prev => [...prev, assistantMsg]);
      await fetchSessions(currentSessionId || undefined);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I'm having trouble connecting to the server right now. (${error.message})`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const getIntentBadge = (intent?: string) => {
    const map: Record<string, { label: string; icon: any; className: string }> = {
      POLICY_QA: { label: "Policy QA", icon: FileText, className: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
      SQL_QUERY:  { label: "Data Query", icon: Database, className: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
      HR_ACTION:  { label: "HR Action", icon: Zap, className: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
      MALICIOUS:  { label: "Blocked", icon: ShieldAlert, className: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
    };
    const m = map[intent ?? ""];
    if (!m) return null;
    const Icon = m.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.className}`}>
        <Icon className="h-2.5 w-2.5" />{m.label}
      </span>
    );
  };

  const handleNewConversation = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hi **${user.name || user.email?.split("@")[0]}**! I'm the NovaWorks PeopleOps Copilot.\n\nI can help you with HR policies, employee data queries, and automated HR actions. Pick a quick prompt below or type your own question.`,
      },
    ]);
  };

  // ── Shared chat body (used in both inline and fullscreen) ──────────────────
  const chatBody = (
    <>
      {/* Premium Dedicated Inline Header */}
      {!isChatFullscreen && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
          <div className="flex items-center gap-2">
            {!isMobile && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 mr-1 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Toggle Sidebar"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
            )}

            <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              PeopleOps Copilot
            </span>
            <span className="text-[9px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800 font-extrabold uppercase">
              {role}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleNewConversation}
              className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="New Conversation"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsChatFullscreen(true)}
              className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Expand to fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className={`flex-1 overflow-y-auto ${isChatFullscreen ? 'p-6 md:p-10' : 'p-4 md:p-6'}`} ref={scrollRef}>
        <div className={`${isChatFullscreen ? 'max-w-5xl mx-auto space-y-8 pb-8' : 'space-y-6 pb-6'}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className={`h-9 w-9 mt-1 shrink-0 shadow-sm ${msg.role === "user" ? "bg-zinc-200 dark:bg-zinc-800" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"}`}>
                {msg.role === "user" ? (
                  <AvatarFallback className="text-sm font-black">{(user.email?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-transparent"><Bot className="h-4 w-4 text-white" /></AvatarFallback>
                )}
              </Avatar>

              <div className={`flex flex-col gap-2 ${msg.role === "user" ? "max-w-[85%] items-end" : "max-w-[100%] w-full items-start"}`}>
                {/* Normal text bubble */}
                <div className={`rounded-2xl shadow-md leading-relaxed ${
                  isChatFullscreen 
                    ? 'px-6 py-4 text-[15px] md:text-base' 
                    : 'px-4 py-3 text-[15px]'
                } ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}>
                  <div className={`${isChatFullscreen ? 'prose prose-sm md:prose-base dark:prose-invert prose-p:leading-relaxed' : 'prose prose-sm md:prose-base dark:prose-invert'} prose-pre:p-0 max-w-none`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>

                {((msg.intent && msg.intent !== "UNKNOWN") || (msg.sources && msg.sources.length > 0) || (msg.rows && msg.rows.length > 1 && expandedDashboards[msg.id])) && (
                  <div className="flex flex-wrap gap-2 mt-0.5 items-center">
                    {msg.intent && msg.intent !== "UNKNOWN" && getIntentBadge(msg.intent)}
                    {msg.sources && msg.sources.map((s, i) => (
                      <div key={i} className="flex items-center text-xs bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-full px-2.5 py-0.5 text-purple-700 dark:text-purple-300 font-medium">
                        <FileText className="h-3 w-3 mr-1" />{s.title}
                      </div>
                    ))}
                    {msg.rows && msg.rows.length > 1 && expandedDashboards[msg.id] && (
                      <button 
                        onClick={() => setExpandedDashboards(prev => ({ ...prev, [msg.id]: false }))}
                        className="flex items-center text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-0.5 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
                        title="Hide Data Details"
                      >
                        <Minimize2 className="h-2.5 w-2.5 mr-1" /> HIDE
                      </button>
                    )}
                  </div>
                )}

                <AnalyticsDashboard 
                  rows={msg.rows} 
                  sql={msg.sql} 
                  devMetadata={msg.devMetadata} 
                  isExpanded={expandedDashboards[msg.id] || false}
                  onToggleExpanded={(val) => setExpandedDashboards(prev => ({ ...prev, [msg.id]: val }))}
                />

                {msg.actionResult?.blocked && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-3 w-full">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Action Blocked: {msg.actionResult.reason}</span>
                  </div>
                )}

                {devMode && msg.devMetadata && <DevMetadataBlock data={msg.devMetadata} />}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <Avatar className="h-11 w-11 mt-1 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-white" /></AvatarFallback>
              </Avatar>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-5 py-3.5 flex items-center gap-2 h-11 shadow-sm">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Prompts */}
      {showSuggestions && (
        <div className="border-t border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
          <SuggestedPrompts role={role} onSelect={(p) => handleSend(p)} />
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t p-3 md:p-4 bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit} className="flex gap-3 relative max-w-5xl mx-auto w-full items-center">
          {/* Dev Mode (Admin only) */}
          {role === "ADMIN" && (
            <button
              type="button"
              onClick={() => setDevMode(!devMode)}
              className={`h-11 w-11 flex items-center justify-center rounded-full shrink-0 transition-all duration-200 active:scale-95 shadow-sm border ${devMode ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400"}`}
              title="Toggle Developer Telemetry"
            >
              <Terminal className="h-4 w-4" />
            </button>
          )}

          {/* Re-show suggestions */}
          {!showSuggestions && (
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="h-11 w-11 flex items-center justify-center rounded-full shrink-0 transition-all duration-200 active:scale-95 shadow-sm border bg-white border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
              title="Show suggested prompts"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const target = e.target;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                if (input.trim() && !loading) {
                  handleSubmit(e as any);
                }
              }
            }}
            placeholder="Ask about HR policies, data, or take an action... (Shift+Enter for newline)"
            className="flex-1 resize-none rounded-2xl px-5 py-3 min-h-[44px] max-h-[150px] text-sm md:text-base border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 scrollbar-thin dark:text-white"
            disabled={loading}
            rows={1}
            style={{ overflowY: 'auto' }}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full h-11 w-11 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shrink-0 shadow-md transition-all duration-200 active:scale-95"
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </>
  );

  const fullChatLayout = (
    <div className="flex flex-row flex-1 overflow-hidden h-full relative">
      <ChatSidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />
      <div className="flex flex-col flex-1 min-w-0 bg-white dark:bg-zinc-950">
        {chatBody}
      </div>
    </div>
  );

  // ── Fullscreen overlay via Portal ─────────────────────────────────────────
  if (isChatFullscreen) {
    const roleBadge: Record<string, { label: string; cls: string }> = {
      ADMIN:    { label: "Admin",   cls: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30" },
      MANAGER:  { label: "Manager", cls: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" },
      EMPLOYEE: { label: "Employee",cls: "bg-blue-500/20 text-blue-200 border-blue-400/30" },
    };
    const badge = roleBadge[role] ?? roleBadge.EMPLOYEE;

    return (
      <Portal>
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-zinc-950 animate-in fade-in duration-200">

          {/* Fullscreen Header — compact & premium */}
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 shrink-0 border-b border-white/5">
            <div className="flex items-center gap-3">
              {!isMobile && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Toggle Sidebar"
                >
                  {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </button>
              )}

              {/* Bot icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">NovaWorks AI Copilot</p>
                <p className="text-[10px] text-zinc-400 font-medium">PeopleOps Assistant</p>
              </div>
              {/* Role badge */}
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                {badge.label}
              </span>
              {/* Message count */}
              <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNewConversation}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="New Conversation"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsChatFullscreen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Exit fullscreen (Esc)"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsChatFullscreen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat content — fills remaining viewport */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {fullChatLayout}
          </div>
        </div>
      </Portal>
    );
  }

  // ── Inline (normal) view ──────────────────────────────────────────────────
  return fullChatLayout;
}
