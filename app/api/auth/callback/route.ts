import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_param = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // On Vercel, origin can be an internal URL — use x-forwarded-host for the real domain
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl =
    forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  // If Supabase/Google returned an error directly
  if (error_param) {
    console.error("[auth/callback] OAuth error:", error_param, error_description);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error_description || error_param)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
    console.error("[auth/callback] Code exchange failed:", error.message);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  console.error("[auth/callback] No code and no error in callback URL");
  return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
}
