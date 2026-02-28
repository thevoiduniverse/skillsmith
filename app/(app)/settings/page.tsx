"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconUserFilled, IconChartBar, IconLogout } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { track } from "@/lib/analytics";

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
  const [, setSaved] = useState(false);
  const [usage, setUsage] = useState<{
    hourlyRequests: number;
    dailyTokens: number;
  } | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<
    Array<{ label: string; requests: number; tokens: number }>
  >([]);

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

      // Build 7-day breakdown for bar chart
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weeklyRows } = await supabase
        .from("api_usage")
        .select("request_count, input_tokens, output_tokens, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo);

      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { requests: number; tokens: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        buckets[d.toISOString().slice(0, 10)] = { requests: 0, tokens: 0 };
      }
      for (const row of weeklyRows || []) {
        const key = row.created_at.slice(0, 10);
        if (buckets[key]) {
          buckets[key].requests += row.request_count || 1;
          buckets[key].tokens += (row.input_tokens || 0) + (row.output_tokens || 0);
        }
      }
      const todayKey = new Date().toISOString().slice(0, 10);
      setDailyBreakdown(
        Object.entries(buckets).map(([dateStr, data]) => ({
          label: dateStr === todayKey ? "Today" : dayLabels[new Date(dateStr + "T12:00:00").getDay()],
          requests: data.requests,
          tokens: data.tokens,
        }))
      );

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
    track("logout");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Profile */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconUserFilled size={16} className="text-[rgba(255,255,255,0.6)]" />
              <h2 className="text-sm font-semibold text-white">Profile</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
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
            <div className="mt-auto pt-2">
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
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconChartBar size={16} className="text-[rgba(255,255,255,0.6)]" />
              <h2 className="text-sm font-semibold text-white">API Usage</h2>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="h-px bg-[rgba(255,255,255,0.06)] mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="flex-1 h-[7px] rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">
                      {usage?.hourlyRequests ?? 0}
                      <span className="text-sm text-[rgba(255,255,255,0.4)] font-normal">
                        {" "}/ 50
                      </span>
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                      Requests this hour
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-mono font-bold text-white">
                      {((usage?.dailyTokens ?? 0) / 1000).toFixed(1)}k
                      <span className="text-sm text-[rgba(255,255,255,0.4)] font-normal">
                        {" "}/ 100k
                      </span>
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                      Tokens today
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[rgba(255,255,255,0.06)] mb-4" />
                <div className="space-y-3">
                  {(() => {
                    const peak = Math.max(
                      ...dailyBreakdown.map((d) => d.requests),
                      1
                    );
                    return dailyBreakdown.map((day, i) => {
                      const pct = (day.requests / peak) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[11px] text-[rgba(255,255,255,0.45)] w-8 shrink-0 text-right font-medium">
                            {day.label}
                          </span>
                          <div className="flex-1 h-[7px] bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${day.requests > 0 ? Math.max(pct, 4) : 0}%`,
                                background:
                                  "linear-gradient(90deg, #3d6b00, #bfff00)",
                                boxShadow:
                                  day.requests > 0
                                    ? "0 0 10px rgba(191,255,0,0.3), 0 0 3px rgba(191,255,0,0.5)"
                                    : "none",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-[rgba(255,255,255,0.35)] w-6 shrink-0 text-right font-mono">
                            {day.requests}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sign Out */}
      <Button variant="danger" onClick={handleSignOut}>
        <IconLogout size={16} />
        Sign Out
      </Button>
    </div>
  );
}
