"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [, setSaved] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-8 flex flex-col justify-center min-h-[calc(100vh-10rem)]">
      <h1 className="font-display text-xl md:text-3xl font-bold text-white text-center">
        Profile
      </h1>

      <Card className="flex flex-col">
        <CardContent className="pt-8 flex flex-col gap-4 flex-1">
          {loading ? (
            <div className="animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)] h-52" />
          ) : (
            <>
              <div>
                <Label>Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled className="opacity-60" />
              </div>
              <div className="mt-auto pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
