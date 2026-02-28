"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function TemplateViewTracker({ templateId }: { templateId: string }) {
  useEffect(() => {
    track("template_viewed", { template_id: templateId });
  }, [templateId]);
  return null;
}
