"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  Bot,
  FolderKanban,
  LogOut,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/directory", label: "Employees", icon: Users },
  { href: "/dashboard/leaves", label: "Leave Management", icon: Calendar },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
  { href: "/dashboard/ingest", label: "Document Ingestion", icon: FileText },
];

const managerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
  { href: "/dashboard/directory", label: "My Team", icon: Users },
  { href: "/dashboard/leaves", label: "Leave Approvals", icon: Calendar },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
];

const employeeLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
  { href: "/dashboard/leaves", label: "My Leaves", icon: Calendar },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
];

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MANAGER: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  EMPLOYEE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const r = role?.toUpperCase() || "EMPLOYEE";

  const links =
    r === "ADMIN" ? adminLinks :
    r === "MANAGER" ? managerLinks :
    employeeLinks;

  return (
    <div className="flex flex-col w-64 border-r bg-white dark:bg-zinc-900 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <LayersIcon />
        </div>
        <div>
          <p className="font-bold text-base tracking-tight leading-none">CB Nest</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">NovaWorks HRMS</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          {r === "ADMIN" ? "Administration" : r === "MANAGER" ? "Management" : "My Workspace"}
        </p>
        <nav className="space-y-0.5 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = (link as any).exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                  )}
                />
                {link.label}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: role badge + logout */}
      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
              roleBadgeColors[r] || roleBadgeColors["EMPLOYEE"]
            )}
          >
            {r}
          </div>
          <span className="text-xs text-zinc-500">Active session</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function LayersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}
