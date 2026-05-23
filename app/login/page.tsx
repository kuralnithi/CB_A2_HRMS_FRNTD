"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Layers,
  Eye,
  EyeOff,
  Shield,
  Users,
  User,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  Database,
  ArrowRight,
  Cpu,
  KeyRound
} from "lucide-react";

type RoleType = "employee" | "manager" | "admin";

export default function LoginPage() {
  const [email, setEmail] = useState("employee@novaworks.local");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>("employee");
  const [activeSlide, setActiveSlide] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@novaworks.local");
    } else if (role === "manager") {
      setEmail("manager@novaworks.local");
    } else {
      setEmail("employee@novaworks.local");
    }
    setPassword("password123");
    toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials pre-filled!`, {
      duration: 2000,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Please check your username and password.");
      } else {
        toast.success("Welcome back! Login successful.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 font-sans bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes strokePulse {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          stroke-dasharray: 6;
          animation: strokePulse 1.2s linear infinite;
        }
        @keyframes orbitSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit-slow {
          animation: orbitSlow 25s linear infinite;
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-soft {
          animation: pulseSoft 4s ease-in-out infinite;
        }
      `}} />

      {/* Left Pane - Visual & Brand Presentation (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-12 text-white relative overflow-visible z-10">
        {/* Slanted Border Glowing Line */}
        <div className="absolute inset-y-0 left-0 w-[115.5%] bg-gradient-to-b from-indigo-500/30 via-blue-500/30 to-purple-500/30 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-0 pointer-events-none" />
        
        {/* Slanted Dark Background */}
        <div className="absolute inset-y-0 left-0 w-[115%] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-0 shadow-2xl pointer-events-none" />

        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-[35%] right-[-15%] w-[45%] h-[45%] rounded-full bg-purple-500/5 blur-[90px] pointer-events-none z-0" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
            <Layers className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              NovaWorks
            </h1>
            <p className="text-xs text-zinc-400 tracking-wider font-medium uppercase">
              PeopleOps Copilot
            </p>
          </div>
        </div>

        {/* Main Content Area (Auto-sliding feature presentation) */}
        <div className="my-auto relative z-10 w-full max-w-lg h-[460px] overflow-hidden flex flex-col justify-between">
          
          {/* SLIDE 0: Business Value / Core ROI */}
          <div className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col justify-between ${
            activeSlide === 0 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10" 
              : "opacity-0 -translate-x-12 scale-95 pointer-events-none z-0"
          }`}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                ★ Trusted by Enterprise Teams
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-white via-zinc-100 to-amber-300 bg-clip-text text-transparent">
                Supercharge HR Operations by 10x.
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-md">
                Reduce manual HR inquiry backlogs. NovaWorks auto-resolves 82% of routine employee questions, giving your PeopleOps team hours back every single day.
              </p>
            </div>

            {/* Visual Card for Slide 0: ROI Dashboard */}
            <div className="relative w-full max-w-md p-6 bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-xl text-left space-y-4">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2 relative z-10">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase font-mono">Performance Impact Metrics</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold uppercase">ROI Verified</span>
              </div>

              <div className="grid grid-cols-3 gap-3 relative z-10 pt-1">
                {/* Metric 1 */}
                <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] text-center shadow-lg">
                  <span className="text-2xl font-extrabold text-emerald-400 flex items-center justify-center gap-0.5">
                    90%<span className="text-xs shrink-0 text-emerald-400">▲</span>
                  </span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 font-mono">Time Saved</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5 leading-tight">Query Resolution</p>
                </div>

                {/* Metric 2 */}
                <div className="p-3.5 rounded-xl border border-blue-500/10 bg-blue-500/[0.02] text-center shadow-lg">
                  <span className="text-2xl font-extrabold text-blue-400 flex items-center justify-center gap-0.5">
                    40%<span className="text-xs shrink-0 text-blue-400">▼</span>
                  </span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 font-mono">Cost Cut</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5 leading-tight">Support Overhead</p>
                </div>

                {/* Metric 3 */}
                <div className="p-3.5 rounded-xl border border-purple-500/10 bg-purple-500/[0.02] text-center shadow-lg">
                  <span className="text-2xl font-extrabold text-purple-400 flex items-center justify-center">
                    99.8%
                  </span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 font-mono">Accuracy</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5 leading-tight">Grounded RAG Search</p>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 1: Employee Self-Service / Convenience */}
          <div className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col justify-between ${
            activeSlide === 1 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10" 
              : "opacity-0 -translate-x-12 scale-95 pointer-events-none z-0"
          }`}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold tracking-wide">
                ⚡ Friction-Free Adoption
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-white via-zinc-100 to-emerald-300 bg-clip-text text-transparent">
                Your Entire HR Handbook,<br />
                Always in Pocket.
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-md">
                Empower staff to query allowances, leaves, and guidelines instantly in natural language. Zero search fatigue, zero training, and immediate compliant answers.
              </p>
            </div>

            {/* Visual Card for Slide 1: Self-Service Preview */}
            <div className="relative w-full max-w-md p-5 bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-xl text-left space-y-3.5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2 relative z-10 text-[9px] font-bold text-zinc-500 uppercase font-mono">
                <span>Self-Service Portal</span>
                <span className="text-emerald-400">● 100% Citation Grounded</span>
              </div>

              {/* Chat flow mockup */}
              <div className="space-y-3 relative z-10 text-xs font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0 border border-indigo-500/10">
                    U
                  </div>
                  <div className="bg-zinc-800/40 rounded-xl p-2.5 max-w-[85%] text-zinc-300 leading-normal">
                    Can I claim broadband reimbursement?
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/10 text-emerald-400">
                    ★
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 max-w-[85%] text-zinc-200 border border-white/5 leading-normal space-y-1.5">
                    <p>
                      Yes. Under the <strong className="text-white">WFH Policy (Sec. 4.2)</strong>, you can claim up to <strong className="text-white">$50/month</strong> for home internet bills.
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono">WFH_Allowances_2026.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: Security & Enterprise Compliance */}
          <div className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col justify-between ${
            activeSlide === 2 
              ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10" 
              : "opacity-0 -translate-x-12 scale-95 pointer-events-none z-0"
          }`}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-400 text-xs font-bold tracking-wide">
                🔒 SOC2 & GDPR Guarded Design
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-white via-zinc-100 to-purple-300 bg-clip-text text-transparent">
                Enterprise Trust.<br />
                Uncompromising Security.
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-md">
                Every natural language command passes through a strict double-layer SQL compiler filter. Sensitive payroll databases remain secure, and every interaction is audit-logged.
              </p>
            </div>

            {/* Visual Card for Slide 2: Compliance Blueprint */}
            <div className="relative w-full max-w-md p-5 bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-xl text-left space-y-3.5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2 relative z-10 text-[9px] font-bold text-zinc-500 uppercase font-mono">
                <span>Security Engine Blueprint</span>
                <span className="text-purple-400">Dual-Level Guardrails</span>
              </div>

              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="h-5 w-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-emerald-500/10">✓</div>
                  <span className="font-semibold text-zinc-200">Read-Only SQL Enforcement</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">Active</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="h-5 w-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-emerald-500/10">✓</div>
                  <span className="font-semibold text-zinc-200">Automated PII Masking & Filters</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">Active</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="h-5 w-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-emerald-500/10">✓</div>
                  <span className="font-semibold text-zinc-200">Full Cryptographic Audit Logs</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">Active</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Indicators / Navigation Dots */}
        <div className="flex items-center gap-2.5 relative z-20 pb-4">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveSlide(idx);
                toast.dismiss();
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx 
                  ? "w-8 bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md shadow-indigo-500/25" 
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-500 flex justify-between items-center relative z-10 border-t border-zinc-800/40 pt-6">
          <span>NovaWorks HRMS Platform v2.1</span>
          <span>© 2026 NovaWorks, Inc.</span>
        </div>
      </div>

      {/* Right Pane - Form & Actions */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-6 flex flex-col items-center justify-center p-6 md:p-12 lg:pl-20 xl:pl-24 relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Mobile Header (Visible only on smaller viewports) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">NovaWorks</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">PeopleOps Copilot</p>
          </div>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-md space-y-7 relative z-10">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome back
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Please sign in to access your dashboard and secure AI agent playground.
            </p>
          </div>

          {/* Quick Login Workspace Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-indigo-500" /> Fast Role Select
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Password: password123</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Employee Badge */}
              <button
                type="button"
                onClick={() => handleRoleSelect("employee")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 focus:outline-none relative group cursor-pointer ${
                  selectedRole === "employee"
                    ? "border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-md shadow-blue-500/5"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 transition-colors duration-300 ${
                  selectedRole === "employee"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                }`}>
                  <User className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Employee</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-tight font-medium">Portal Access</span>
              </button>

              {/* Manager Badge */}
              <button
                type="button"
                onClick={() => handleRoleSelect("manager")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 focus:outline-none relative group cursor-pointer ${
                  selectedRole === "manager"
                    ? "border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/5"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 transition-colors duration-300 ${
                  selectedRole === "manager"
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                }`}>
                  <Users className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Manager</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-tight font-medium">Team Leads</span>
              </button>

              {/* Admin Badge */}
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 focus:outline-none relative group cursor-pointer ${
                  selectedRole === "admin"
                    ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/5"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 transition-colors duration-300 ${
                  selectedRole === "admin"
                    ? "bg-indigo-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                }`}>
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Admin</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-tight font-medium">Full Director</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-50 dark:bg-zinc-950 px-3 text-zinc-500 dark:text-zinc-400 font-semibold tracking-wide">
                Or enter credentials
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                Work Email Address
              </Label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@novaworks.local"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Reset role select highlight if user starts custom typing
                    setSelectedRole("" as any);
                  }}
                  className="pl-10.5 py-6 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-500 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                  Workspace Password
                </Label>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10.5 pr-11 py-6 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-500 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 border-0 flex items-center justify-center gap-2 cursor-pointer group/btn active:scale-[0.99] transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Access HR Workspace
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Secure Sign-In Note */}
          <div className="bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-3.5 text-center text-xs text-zinc-500 dark:text-zinc-400 leading-normal flex items-start gap-2.5">
            <Shield className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-left font-medium">
              You are accessing a secure platform protected by dual audit-logging. All AI agent interactions are fully auditable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
