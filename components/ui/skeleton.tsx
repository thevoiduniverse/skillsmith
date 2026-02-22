import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface-alt rounded-2xl animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
