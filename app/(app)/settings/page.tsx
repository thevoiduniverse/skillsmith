"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, ChartBar, SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)] ${className || ""}`}
    />
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState<{
    hourlyRequests: number;
    dailyTokens: number;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile) setDisplayName(profile.display_name || "");

      // Load usage stats
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: hourly } = await supabase
        .from("api_usage")
        .select("request_count")
        .eq("user_id", user.id)
        .gte("created_at", oneHourAgo);

      const { data: daily } = await supabase
        .from("api_usage")
        .select("input_tokens, output_tokens")
        .eq("user_id", user.id)
        .gte("created_at", oneDayAgo);

      setUsage({
        hourlyRequests: (hourly || []).reduce((s, r) => s + (r.request_count || 1), 0),
        dailyTokens: (daily || []).reduce(
          (s, r) => s + (r.input_tokens || 0) + (r.output_tokens || 0),
          0
        ),
      });
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Settings
      </h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle weight="fill" className="w-4 h-4 text-[rgba(255,255,255,0.6)]" />
            <h2 className="text-sm font-semibold text-white">Profile</h2>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label className={loading ? "invisible" : ""}>Display Name</Label>
            <div className="relative">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className={loading ? "invisible" : ""}
              />
              {loading && <Skeleton className="absolute inset-0 rounded-2xl" />}
            </div>
          </div>
          <div>
            <Label className={loading ? "invisible" : ""}>Email</Label>
            <div className="relative">
              <Input value={email} disabled className={loading ? "invisible" : "opacity-60"} />
              {loading && <Skeleton className="absolute inset-0 rounded-2xl" />}
            </div>
          </div>
          <div className="mt-2">
            <div className="relative inline-block">
              <Button onClick={handleSave} disabled={saving || loading} className={loading ? "invisible" : ""}>
                Save Changes
              </Button>
              {loading && <Skeleton className="absolute inset-0 rounded-[40px]" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChartBar weight="fill" className="w-4 h-4 text-[rgba(255,255,255,0.6)]" />
            <h2 className="text-sm font-semibold text-white">API Usage</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative bg-[rgba(255,255,255,0.05)] rounded-2xl p-4">
              <div className={loading ? "invisible" : ""}>
                <p className="text-xs text-[rgba(255,255,255,0.6)] mb-1">Requests (last hour)</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {usage?.hourlyRequests ?? 0}
                  <span className="text-sm text-[rgba(255,255,255,0.6)] font-normal"> / 50</span>
                </p>
                <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#bfff00] rounded-full transition-all"
                    style={{ width: `${Math.min(((usage?.hourlyRequests ?? 0) / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {loading && (
                <div className="absolute inset-0 p-4 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              )}
            </div>
            <div className="relative bg-[rgba(255,255,255,0.05)] rounded-2xl p-4">
              <div className={loading ? "invisible" : ""}>
                <p className="text-xs text-[rgba(255,255,255,0.6)] mb-1">Tokens (last 24h)</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {((usage?.dailyTokens ?? 0) / 1000).toFixed(1)}k
                  <span className="text-sm text-[rgba(255,255,255,0.6)] font-normal"> / 100k</span>
                </p>
                <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#bfff00] rounded-full transition-all"
                    style={{ width: `${Math.min(((usage?.dailyTokens ?? 0) / 100000) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {loading && (
                <div className="absolute inset-0 p-4 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="danger" onClick={handleSignOut}>
        <SignOut weight="fill" className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
