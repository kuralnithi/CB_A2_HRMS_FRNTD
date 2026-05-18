"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log("ProfilePage: session changed", { 
      hasSession: !!session, 
      token: (session?.user as any)?.accessToken ? "exists" : "missing" 
    });

    if (session) {
      if ((session.user as any)?.accessToken) {
        fetchProfile();
      } else {
        console.warn("ProfilePage: session exists but no accessToken");
        setLoading(false);
      }
    } else {
      // Safety timeout if session takes too long to initialize
      const timer = setTimeout(() => {
        if (loading) {
          console.log("ProfilePage: Session timeout reached");
          setLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const fetchProfile = async () => {
    const token = (session?.user as any)?.accessToken;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("ProfilePage: fetching profile...");
      const res = await fetchApi("/employees/me", token);
      if (res.ok) {
        const data = await res.json();
        console.log("ProfilePage: success", data);
        setProfile(data);
      } else {
        const error = await res.json().catch(() => ({}));
        console.error("ProfilePage: API error", res.status, error);
        toast.error(`Error: ${error.detail || res.statusText}`);
      }
    } catch (e: any) {
      console.error("ProfilePage: network error", e);
      toast.error(e.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = (session?.user as any)?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/employees/profile-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, profile_photo_url: data.url }));
        toast.success("Profile picture updated successfully!");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Failed to upload image");
      }
    } catch (e) {
      console.error("Upload error:", e);
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-zinc-100 border-t-primary animate-spin dark:border-zinc-800" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">Securing your session...</p>
            <p className="text-sm text-muted-foreground">This usually takes just a few seconds</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLoading(false)} className="mt-4 rounded-full px-6">
            Stop Loading
          </Button>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 px-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center dark:bg-red-900/10">
            <Mail className="h-10 w-10 text-red-500" />
          </div>
          <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white border-4 border-red-50 flex items-center justify-center dark:bg-zinc-950 dark:border-zinc-900">
            <span className="text-red-500 font-bold text-lg">!</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold tracking-tight">Profile Access Required</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            We couldn't connect your session to an employee record. This can happen if you're an Admin or if the session expired.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">
            Refresh Page
          </Button>
          <Button onClick={fetchProfile} className="rounded-full px-8">
            Try Fetching Again
          </Button>
        </div>
      </div>
    );
  }

  const initials = profile?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  // The API returns /static/uploads/... which should be absolute or served correctly
  const photoUrl = profile?.profile_photo_url 
    ? (profile.profile_photo_url.startsWith("http") ? profile.profile_photo_url : `${apiUrl.replace("/api/v1", "")}${profile.profile_photo_url}`)
    : "";

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
          My Profile
        </h1>
        <p className="text-muted-foreground">Manage your personal and professional identity at NovaWorks</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700" />
            <CardContent className="relative pt-0 flex flex-col items-center -mt-16">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-900 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={photoUrl} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all z-10">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    disabled={uploading} 
                  />
                </label>
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">{profile?.name}</h2>
                <p className="text-primary font-semibold text-sm uppercase tracking-wide mt-1">
                  {profile?.designation}
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold dark:bg-zinc-800 dark:text-zinc-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  {profile?.department_name || "Internal"}
                </div>
              </div>

              <div className="mt-10 w-full space-y-5 border-t pt-8 dark:border-zinc-800">
                <div className="flex items-center gap-4 text-sm hover:text-primary transition-colors cursor-default">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium truncate">{session?.user?.email}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm hover:text-primary transition-colors cursor-default">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{profile?.phone || "Not provided"}</span>
                </div>

                <div className="flex items-center gap-4 text-sm hover:text-primary transition-colors cursor-default">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{profile?.work_location || "Remote"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b dark:border-zinc-800 pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 py-8 sm:grid-cols-2">
              <InfoItem label="Employee ID" value={profile?.employee_code} />
              <InfoItem label="Current Status" value={profile?.employment_status} badge={true} />
              <InfoItem label="Date of Joining" value={profile?.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
              <InfoItem label="Total Experience" value={profile?.years_of_experience ? `${profile.years_of_experience} Years` : null} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b dark:border-zinc-800 pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 py-8 sm:grid-cols-2">
              <InfoItem label="Gender" value={profile?.gender} />
              <InfoItem label="Date of Birth" value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
            </CardContent>
          </Card>

          {profile?.skills && (
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b dark:border-zinc-800 pb-4">
                <CardTitle className="text-xl">Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="py-8">
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.split(",").map((skill: string) => (
                    <span 
                      key={skill} 
                      className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg text-sm font-semibold cursor-default"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, badge = false }: { label: string, value: any, badge?: boolean }) {
  return (
    <div className="group space-y-1.5 transition-all">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">{label}</p>
      {badge && value ? (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {value}
        </span>
      ) : (
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{value || "—"}</p>
      )}
    </div>
  );
}
