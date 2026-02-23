"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(23, 23, 23, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          backdropFilter: "blur(12px)",
        },
      }}
    />
  );
}
