"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path into segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isLast = index === segments.length - 1;
    
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center space-x-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.length > 0 && <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />}
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-1.5">
          {crumb.isLast ? (
            <span className="text-zinc-900 dark:text-zinc-50 font-semibold truncate max-w-[150px] md:max-w-none">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
          )}
        </div>
      ))}
    </nav>
  );
}
