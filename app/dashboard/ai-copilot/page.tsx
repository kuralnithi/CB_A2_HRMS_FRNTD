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
    <div className="flex flex-col h-[calc(100vh-13rem)] sm:h-[calc(100vh-12rem)] overflow-hidden">
      <div className="mb-4 shrink-0">
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
