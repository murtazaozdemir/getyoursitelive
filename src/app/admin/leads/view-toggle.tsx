"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ViewToggle({ view }: { view: string }) {
  const searchParams = useSearchParams();

  function hrefForView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    return `/admin/leads?${params.toString()}`;
  }

  return (
    <div className="admin-view-toggle">
      <Link
        href={hrefForView("pipeline")}
        className={`admin-view-toggle-btn${view === "pipeline" ? " admin-view-toggle-btn--active" : ""}`}
      >
        Pipeline
      </Link>
      <Link
        href={hrefForView("cards")}
        className={`admin-view-toggle-btn${view === "cards" ? " admin-view-toggle-btn--active" : ""}`}
      >
        Cards
      </Link>
    </div>
  );
}
