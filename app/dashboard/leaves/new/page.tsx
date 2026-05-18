"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";

export default function RequestLeavePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      leave_type: formData.get("leave_type"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      reason: formData.get("reason"),
    };

    try {
      const res = await fetchApi("/leaves/", (session?.user as any)?.accessToken, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMsg = "Failed to submit leave request";
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMsg = errorData.detail.map((e: any) => e.msg).join(', ');
          }
        }
        throw new Error(errorMsg);
      }

      router.push("/dashboard/leaves");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leaves" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Request Leave</h2>
          <p className="text-muted-foreground mt-2">Submit a new time-off request for manager approval.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Details</CardTitle>
          <CardDescription>Select your dates and provide a reason for the absence.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Leave Type</label>
              <select 
                name="leave_type" 
                required
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="ANNUAL">Annual Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input 
                  type="date" 
                  name="start_date" 
                  required 
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <input 
                  type="date" 
                  name="end_date" 
                  required 
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea 
                name="reason" 
                required
                rows={4}
                className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Please provide details about your leave request..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Link href="/dashboard/leaves" className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
