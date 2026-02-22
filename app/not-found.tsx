import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-text-primary mb-2">
        4<span className="text-accent">0</span>4
      </h1>
      <p className="text-text-secondary text-lg mb-8">
        Page not found
      </p>
      <Link
        href="/"
        className="bg-accent text-black font-bold rounded-2xl px-6 py-3 hover:bg-accent-hover transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
