"use client";

import { useRouter } from "next/navigation";
import { SignOut, UserCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-end px-6 gap-2">
      <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
        <UserCircle weight="fill" className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <SignOut weight="fill" className="w-4 h-4" />
      </Button>
    </header>
  );
}
