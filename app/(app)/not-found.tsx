import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl font-bold text-white mb-4">
        404
      </div>
      <p className="text-[rgba(255,255,255,0.6)] mb-6">
        This page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link href="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
