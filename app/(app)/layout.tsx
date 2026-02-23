import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { DotCanvas } from "@/components/ui/dot-canvas";

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
      {/* Animated dot background with Plinko ball */}
      <DotCanvas accentColor="#BFFF00" className="fixed inset-0 z-0" showGlow={false} />

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
      <ToastProvider />
    </div>
  );
}
