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
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2",
              isActive
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
