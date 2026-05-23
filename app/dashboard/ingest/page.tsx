import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentUpload from "@/components/admin/document-upload";

export default async function IngestPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative group">
      {/* Background Icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
      </div>
      <div className="mb-4 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight">Document Ingestion</h2>
        <p className="text-muted-foreground text-sm">
          Upload HR policies and company documents for the AI Copilot to learn from.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <DocumentUpload token={(session.user as any)?.accessToken} />
      </div>
    </div>
  );
}
