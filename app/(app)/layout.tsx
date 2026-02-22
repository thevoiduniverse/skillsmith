import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen bg-[#0a0a0a]">
      {/* Full-page static dot background with gradient mask */}
      <div className="dot-pattern pointer-events-none fixed inset-0 z-0" />

      {/* Desktop sidebar */}
      <div className="relative z-10 hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <div className="flex items-center md:hidden px-4 h-14 border-b border-border">
          <MobileNav />
          <span className="ml-2 text-lg font-bold text-text-primary tracking-tight">
            <span className="font-asgardFat text-accent">SKILL</span>SMITH
          </span>
        </div>
        <main className="flex-1 px-6 pt-12 pb-6">{children}</main>
      </div>
    </div>
  );
}
