"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  Bot,
  FolderKanban,
  FileText,
} from "lucide-react";

const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/directory", label: "Employees", icon: Users },
  { href: "/dashboard/leaves", label: "Leaves", icon: Calendar },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
  { href: "/dashboard/ingest", label: "Ingestion", icon: FileText },
];

const managerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
  { href: "/dashboard/directory", label: "My Team", icon: Users },
  { href: "/dashboard/leaves", label: "Approvals", icon: Calendar },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
];

const employeeLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/leaves", label: "Leaves", icon: Calendar },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/ai-copilot", label: "AI Copilot", icon: Bot },
];

export default function TopNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const r = role?.toUpperCase() || "EMPLOYEE";

  const links =
    r === "ADMIN" ? adminLinks :
    r === "MANAGER" ? managerLinks :
    employeeLinks;

  return (
    <nav className="flex items-center justify-center space-x-1 overflow-x-hidden no-scrollbar py-1 w-full">
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
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-full border hover:scale-105 active:scale-95",
              isActive
                ? "border-blue-500/50 text-blue-600 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:text-blue-400 dark:border-blue-400/50 dark:bg-blue-400/10 dark:shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                : "border-transparent text-zinc-600 hover:text-blue-600 hover:bg-blue-500/5 hover:border-blue-500/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-400/5 dark:hover:border-blue-400/30 dark:hover:shadow-[0_0_10px_rgba(96,165,250,0.2)]"
            )}
          >
            <Icon className={cn("h-4 w-4 transition-all duration-300", isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "")} />
            <span className={cn("transition-all duration-300", isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "")}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
