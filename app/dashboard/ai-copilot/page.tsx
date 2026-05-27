import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ChatPanel from "@/components/ai/chat-panel";
import { redirect } from "next/navigation";

export default async function AICopilotPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden relative group">
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
      </div>
      <div className="mb-2 shrink-0 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight">AI Copilot</h2>
        <p className="text-muted-foreground text-sm">
          Ask questions about policies, employee data, or automate HR actions.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-white dark:bg-zinc-950 shadow-sm flex flex-col relative">
        <ChatPanel user={session.user as any} />
      </div>
    </div>
  );
}
