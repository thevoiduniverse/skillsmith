import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
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
      <DotCanvas accentColor="#BFFF00" className="fixed inset-0 z-0" showGlow={false} disableCursorTrail />

      {/* Desktop sidebar */}
      <div className="relative z-10 hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 px-4 pt-8 pb-4 md:px-6 md:pt-12 md:pb-6">
{children}
        </main>
      </div>
      <ToastProvider />
    </div>
  );
}
