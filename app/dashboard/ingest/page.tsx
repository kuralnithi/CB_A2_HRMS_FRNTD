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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
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
