"use client";

import { TransitionText } from "@/components/ui/transition-text";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <GlassCard radius={32} className="p-8">
          <div className="w-12 h-12 rounded-full bg-[rgba(191,255,0,0.1)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#bfff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Check your email
          </h2>
          <p className="text-[rgba(255,255,255,0.5)]">
            We sent a confirmation link to <span className="text-white">{email}</span>
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard radius={32} className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create your account
        </h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-transparent text-white rounded-2xl px-4 py-3 backdrop-blur-sm focus:border-[#bfff00] focus:outline-none focus:ring-1 focus:ring-[#bfff00] transition-colors placeholder:text-[rgba(255,255,255,0.25)]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-transparent text-white rounded-2xl px-4 py-3 backdrop-blur-sm focus:border-[#bfff00] focus:outline-none focus:ring-1 focus:ring-[#bfff00] transition-colors placeholder:text-[rgba(255,255,255,0.25)]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-transparent text-white rounded-2xl px-4 py-3 backdrop-blur-sm focus:border-[#bfff00] focus:outline-none focus:ring-1 focus:ring-[#bfff00] transition-colors placeholder:text-[rgba(255,255,255,0.25)]"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#bfff00] text-[#0a0a0a] font-sans font-bold rounded-[40px] px-4 py-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TransitionText active={loading} idle="Create Account" activeText="Creating account..." />
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]" />
          <span className="text-sm text-[rgba(255,255,255,0.4)]">or</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[40px] px-4 py-3 font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#fff" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#fff" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#fff" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#fff" />
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
