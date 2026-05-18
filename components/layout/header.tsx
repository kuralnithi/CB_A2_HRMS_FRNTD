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
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
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
    <div className="flex flex-col border-b bg-white dark:bg-zinc-900 sticky top-0 z-50 max-w-full overflow-x-hidden">
      <header className="flex h-14 items-center justify-between px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md md:hidden flex-shrink-0"
          >
            <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <LayersIcon className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">CB Nest</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block flex-shrink-0" />
          <div className="hidden sm:block min-w-0 overflow-hidden">
            <Breadcrumbs />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors">
              <Avatar className="h-8 w-8">
                {profilePhoto && <AvatarImage src={profilePhoto} className="object-cover" />}
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900 dark:text-blue-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="px-6 pb-2 hidden md:block w-full max-w-full overflow-hidden">
        <TopNav role={initialUser?.role} />
      </div>

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
