"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

const EXTENDED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "FastAPI", "Django", "Flask", "PostgreSQL", "MongoDB", "MySQL", "Redis",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "Ansible",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "LangChain",
  "React Native", "Flutter", "Swift", "Kotlin", "Java", "Go", "Rust", "C++",
  "GraphQL", "REST APIs", "Microservices", "System Design", "DevOps",
  "Figma", "Adobe XD", "UI/UX Design", "Prototyping", "User Research",
  "Selenium", "Pytest", "Jest", "Cypress", "Postman", "API Testing",
  "Data Science", "Pandas", "NumPy", "Spark", "SQL", "Power BI", "Tableau",
  "Project Management", "Agile", "Scrum", "Leadership", "Communication",
  "HR Management", "Recruitment", "Payroll", "Policy Writing",
];

export default function AddEmployeePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = (session?.user as any)?.accessToken;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  // Skills chip input
  const [skillsInput, setSkillsInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    designation: "",
    department_id: "",
    manager_id: "",
    phone: "",
    gender: "",
    date_of_joining: "",
    work_location: "",
    employment_status: "ACTIVE",
    current_salary_usd: "",
    employee_code: "",
    certifications: "",
  });



  useEffect(() => {
    if (!token || sessionStatus !== "authenticated") return;
    // Fetch departments
    fetchApi("/employees/departments", token)
      .then(r => r.ok ? r.json() : []).then(setDepartments).catch(e => console.error(e));
    // Fetch managers/employees list for manager assignment
    fetchApi("/employees/", token)
      .then(r => r.ok ? r.json() : [])
      .then(emps => setManagers(emps.filter((e: any) => e.designation?.toLowerCase().includes("manager") || e.designation?.toLowerCase().includes("lead") || e.designation?.toLowerCase().includes("director"))))
      .catch(e => console.error(e));
  }, [token, sessionStatus]);

  const handleSkillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillsInput(val);
    if (val.trim()) {
      setSkillSuggestions(
        EXTENDED_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !selectedSkills.includes(s)).slice(0, 8)
      );
    } else {
      setSkillSuggestions([]);
    }
  };

  const addSkill = (skill: string) => {
    const v = skill.trim();
    if (v && !selectedSkills.includes(v)) setSelectedSkills([...selectedSkills, v]);
    setSkillsInput(""); setSkillSuggestions([]);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillsInput.trim()) { e.preventDefault(); addSkill(skillsInput); }
    if (e.key === "Backspace" && !skillsInput && selectedSkills.length) setSelectedSkills(selectedSkills.slice(0, -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        skills: selectedSkills.join(", "),
        department_id: form.department_id ? parseInt(form.department_id) : null,
        manager_id: form.manager_id ? parseInt(form.manager_id) : null,
        current_salary_usd: form.current_salary_usd ? parseFloat(form.current_salary_usd) : null,
        date_of_joining: form.date_of_joining || null,
      };
      const res = await fetchApi("/employees/", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/directory/${data.id}`);
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to create employee");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const F = (label: string, key: string, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input required={required} type={type} value={(form as any)[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
    </div>
  );

  const S = (label: string, key: string, opts: { value: string; label: string }[], required = false) => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select required={required} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/directory" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Add New Employee
          </h1>
          <p className="text-sm text-zinc-500">Create a new employee account and profile</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {F("Full Name", "name", "text", "e.g. Rahul Kumar", true)}
            {F("Work Email", "email", "email", "employee@company.com", true)}
            {F("Initial Password", "password", "password", "Min. 8 characters", true)}
            {S("System Role", "role", [
              { value: "EMPLOYEE", label: "Employee" },
              { value: "MANAGER", label: "Manager" },
              { value: "ADMIN", label: "Admin" },
            ], true)}
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Professional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {F("Designation / Title", "designation", "text", "e.g. Senior Developer")}
            {F("Employee Code", "employee_code", "text", "e.g. EMP009")}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Department</label>
              <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Department</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Reporting Manager</label>
              <select value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Manager</option>
                {managers.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.designation || "Manager"})</option>)}
              </select>
            </div>
            {F("Date of Joining", "date_of_joining", "date")}
            {S("Work Location", "work_location", [
              { value: "", label: "Select..." },
              { value: "On-site", label: "On-site" },
              { value: "Remote", label: "Remote" },
              { value: "Hybrid", label: "Hybrid" },
            ])}
            {S("Employment Status", "employment_status", [
              { value: "ACTIVE", label: "Active" },
              { value: "BENCH", label: "Bench" },
              { value: "NOTICE_PERIOD", label: "Notice Period" },
            ])}
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {F("Phone Number", "phone", "tel", "+91-9xxxxxxxxx")}
            {S("Gender", "gender", [
              { value: "", label: "Select..." },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other / Prefer not to say" },
            ])}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Skills & Certifications</h2>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Skills</label>
            <div className="relative flex flex-wrap gap-1.5 items-center px-3 py-2 border rounded-lg min-h-[42px] bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500">
              {selectedSkills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  {s}
                  <button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(sk => sk !== s))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input type="text" value={skillsInput} onChange={handleSkillInput} onKeyDown={handleSkillKeyDown}
                placeholder={selectedSkills.length === 0 ? "Type a skill and press Enter..." : ""}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm" />
              {skillSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {skillSuggestions.map(s => (
                    <button key={s} type="button" onMouseDown={() => addSkill(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Type and press Enter or comma to add. Custom skills are also allowed.</p>
          </div>
          {F("Certifications", "certifications", "text", "e.g. AWS Solutions Architect, CKA")}
        </div>

        {/* Admin-only: Salary */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Compensation <span className="text-red-400 normal-case">(Admin Only)</span></h2>
          {F("Annual Salary (USD)", "current_salary_usd", "number", "e.g. 80000")}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href="/dashboard/directory" className="px-5 py-2 text-sm border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            {loading ? "Creating..." : <><UserPlus className="h-4 w-4" /> Create Employee</>}
          </button>
        </div>
      </form>
    </div>
  );
}
