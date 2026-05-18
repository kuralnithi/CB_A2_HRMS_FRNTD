import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 max-w-full">
      <Header user={session.user as any} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}
