"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Plus, X } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

const TECH_SKILLS = [
  "Python", "FastAPI", "Django", "Node.js", "React", "Next.js", "TypeScript",
  "JavaScript", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "Terraform", "LangChain", "Machine Learning",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techSuggestions, setTechSuggestions] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", project_code: "", client_name: "", description: "",
    project_type: "External", status: "PLANNING", priority: "MEDIUM",
    risk_level: "LOW", billing_type: "FIXED", start_date: "", deadline: "",
    budget_usd: "", estimated_cost: "", repo_url: "", notes: "",
  });

  const handleTechInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTechInput(val);
    setTechSuggestions(val.trim()
      ? TECH_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !techStack.includes(s))
      : []);
  };

  const addTech = (t: string) => {
    if (t.trim() && !techStack.includes(t.trim())) setTechStack([...techStack, t.trim()]);
    setTechInput(""); setTechSuggestions([]);
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && techInput.trim()) { e.preventDefault(); addTech(techInput); }
    if (e.key === "Backspace" && !techInput && techStack.length) setTechStack(techStack.slice(0, -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        tech_stack: techStack.join(", "),
        budget_usd: form.budget_usd ? parseFloat(form.budget_usd) : null,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        start_date: form.start_date || null,
        deadline: form.deadline || null,
      };
      const res = await fetchApi("/projects/", token, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) { const data = await res.json(); router.push(`/dashboard/projects/${data.id}`); }
      else { const err = await res.json(); setError(err.detail || "Failed to create project"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const F = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  const S = (label: string, key: string, opts: string[]) => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{label}</label>
      <select value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
        {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 flex-1 min-h-0 overflow-y-auto pr-2 pb-8 w-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/projects" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><FolderKanban className="h-5 w-5 text-blue-600" /> Create New Project</h1>
          <p className="text-sm text-zinc-500">Set up a new project in the portfolio</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Project Name *</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. E-Commerce Platform"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {F("Project Code", "project_code", "text", "NW-001")}
            {F("Client Name", "client_name", "text", "RetailCo Ltd")}
            {S("Project Type", "project_type", ["Internal", "External", "R&D"])}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Project objectives and scope..."
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Status & Priority</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {S("Status", "status", ["PLANNING","ONGOING","ON_HOLD","COMPLETED","DELAYED","CANCELLED"])}
            {S("Priority", "priority", ["LOW","MEDIUM","HIGH","CRITICAL"])}
            {S("Risk Level", "risk_level", ["LOW","MEDIUM","HIGH"])}
            {S("Billing Type", "billing_type", ["FIXED","TIME_AND_MATERIAL","RETAINER","NON_BILLABLE"])}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Timeline & Budget</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {F("Start Date", "start_date", "date")}
            {F("Deadline", "deadline", "date")}
            {F("Budget (USD)", "budget_usd", "number", "250000")}
            {F("Est. Cost (USD)", "estimated_cost", "number", "200000")}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Technical</h2>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Technology Stack</label>
            <div className="relative flex flex-wrap gap-1.5 items-center px-3 py-2 border rounded-lg min-h-[42px] bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500">
              {techStack.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  {t}<button type="button" onClick={() => setTechStack(techStack.filter(s => s !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input type="text" value={techInput} onChange={handleTechInput} onKeyDown={handleTechKeyDown}
                placeholder={techStack.length === 0 ? "Type tech and press Enter..." : ""}
                className="flex-1 min-w-[100px] outline-none bg-transparent text-sm" />
              {techSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {techSuggestions.map(s => (
                    <button key={s} type="button" onMouseDown={() => addTech(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-zinc-800">{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {F("Repository URL", "repo_url", "url", "https://github.com/...")}
        </div>

        <div className="flex justify-end gap-3 pb-4">
          <Link href="/dashboard/projects" className="px-5 py-2 text-sm border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            {loading ? "Creating..." : <><Plus className="h-4 w-4" /> Create Project</>}
          </button>
        </div>
      </form>
    </div>
  );
}
