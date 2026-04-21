"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/lib/business-context";
import { getOpenStatus } from "@/lib/hours";

/**
 * Live open/closed indicator for the current business.
 * Re-evaluates every 60 seconds so it stays accurate while a customer
 * keeps the page open.
 */
export function OpenStatus({ className = "" }: { className?: string }) {
  const { hoursSchedule } = useBusiness();
  // null on first render to avoid SSR/CSR text mismatch (server can't
  // know the user's local time). Hydrates with the real status.
  const [status, setStatus] = useState<ReturnType<typeof getOpenStatus> | null>(null);

  useEffect(() => {
    const compute = () => setStatus(getOpenStatus(hoursSchedule));
    compute();
    const id = window.setInterval(compute, 60_000);
    return () => window.clearInterval(id);
  }, [hoursSchedule]);

  if (!status) {
    // Reserve space so the layout doesn't jump on hydration
    return <span className={`open-status open-status--placeholder ${className}`}>&nbsp;</span>;
  }

  return (
    <span
      className={`open-status ${status.isOpen ? "open-status--open" : "open-status--closed"} ${className}`}
      aria-live="polite"
    >
      <span className="open-status-dot" aria-hidden />
      <span className="open-status-label">{status.label}</span>
      <span className="open-status-detail">· {status.detail}</span>
    </span>
  );
}
