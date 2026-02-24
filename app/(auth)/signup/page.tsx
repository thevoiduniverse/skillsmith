"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";

export default function SignupPage() {
  const [error, setError] = useState("");
  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams]);

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard radius={32} className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Create your account
        </h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] text-center mb-8">
          Get started with SkillSmith in one click
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2.5 bg-white text-[#0a0a0a] rounded-[40px] px-4 py-3.5 font-bold hover:bg-white/90 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </GlassCard>

      <p className="text-center text-[rgba(255,255,255,0.5)] text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#bfff00] hover:brightness-110 transition-all">
          Sign in
        </Link>
      </p>
    </div>
  );
}
