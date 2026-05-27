"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Menu, X, ChevronUp, ChevronDown } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import Breadcrumbs from "./breadcrumbs";
import TopNav from "./top-nav";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/directory", label: "Employees" },
  { href: "/dashboard/leaves", label: "Leaves" },
  { href: "/dashboard/tickets", label: "Tickets" },
  { href: "/dashboard/ai-copilot", label: "AI Copilot" },
  { href: "/dashboard/ingest", label: "Ingestion" },
];

const managerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "My Projects" },
  { href: "/dashboard/directory", label: "My Team" },
  { href: "/dashboard/leaves", label: "Approvals" },
  { href: "/dashboard/tickets", label: "Tickets" },
  { href: "/dashboard/ai-copilot", label: "AI Copilot" },
];

const employeeLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/leaves", label: "Leaves" },
  { href: "/dashboard/tickets", label: "Tickets" },
  { href: "/dashboard/ai-copilot", label: "AI Copilot" },
];

export default function Header({ user: initialUser }: { user?: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const initials = initialUser?.email?.substring(0, 2).toUpperCase() || "U";
  
  const role = initialUser?.role?.toUpperCase() || "EMPLOYEE";
  const mobileLinks = role === "ADMIN" ? adminLinks : role === "MANAGER" ? managerLinks : employeeLinks;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);
  
  useEffect(() => {
    async function getProfile() {
      const token = (session?.user as any)?.accessToken;
      if (token) {
        try {
          const res = await fetchApi("/employees/me", token);
          if (res.ok) {
            const data = await res.json();
            if (data.profile_photo_url) {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
              const photoUrl = data.profile_photo_url.startsWith("http") 
                ? data.profile_photo_url 
                : `${apiUrl.replace("/api/v1", "")}${data.profile_photo_url}`;
              setProfilePhoto(photoUrl);
            }
          }
        } catch (e) {
          console.error("Header profile fetch error:", e);
        }
      }
    }
    getProfile();
  }, [session]);

  return (
    <div 
      className="flex flex-col sticky top-0 z-50 max-w-full overflow-visible relative transition-all duration-500 ease-in-out group"
      onMouseEnter={() => setIsNavVisible(true)}
      onMouseLeave={() => setIsNavVisible(false)}
    >
      <header className="flex h-14 items-center justify-between px-4 md:px-6 w-full max-w-full overflow-hidden relative z-20 bg-transparent backdrop-blur-xl border-b border-zinc-200/20 dark:border-zinc-800/30 shadow-sm transition-all duration-300 group-hover:bg-white/10 dark:group-hover:bg-zinc-950/20">
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-md md:hidden flex-shrink-0 transition-colors"
          >
            <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <LayersIcon className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block drop-shadow-md">CB Nest</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block flex-shrink-0" />
          <div className="hidden sm:block min-w-0 overflow-hidden">
            <Breadcrumbs />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 outline-none hover:ring-2 hover:ring-blue-500/50 flex items-center justify-center cursor-pointer transition-all shadow-sm">
              <Avatar className="h-8 w-8">
                {profilePhoto && <AvatarImage src={profilePhoto} className="object-cover" />}
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900 dark:text-blue-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-xl" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{initialUser?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                      Role: {initialUser?.role?.toLowerCase() || "Employee"}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50" onClick={() => router.push("/dashboard/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div 
        className={cn(
          "absolute left-0 right-0 top-14 hidden md:block w-full max-w-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top z-10 bg-transparent",
          isNavVisible ? "opacity-100 translate-y-0 pb-3 pt-2 px-6 scale-100 pointer-events-auto" : "opacity-0 -translate-y-4 px-6 scale-95 pointer-events-none"
        )}
      >
        <TopNav role={initialUser?.role} />
      </div>

      {/* Full Page Blur Overlay */}
      <div 
        className={cn(
          "hidden md:block fixed inset-x-0 top-14 h-[100vh] pointer-events-none transition-all duration-500 -z-10",
          isNavVisible ? "backdrop-blur-[3px] bg-white/10 dark:bg-black/20 opacity-100" : "backdrop-blur-none bg-transparent opacity-0"
        )}
      />

      {/* Decorative glossy bottom edge indicator when hidden */}
      <div 
        className={cn(
          "absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-blue-500/40 dark:bg-blue-400/40 backdrop-blur-md transition-all duration-500 hidden md:block shadow-[0_0_10px_rgba(59,130,246,0.5)]",
          isNavVisible ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        )}
      />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-zinc-900 shadow-2xl transition-transform animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="flex h-14 items-center justify-between px-5 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                  <LayersIcon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm tracking-tight">CB Nest</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
