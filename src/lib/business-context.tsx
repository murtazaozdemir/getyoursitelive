"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Business } from "@/lib/business-types";

const BusinessContext = createContext<Business | null>(null);

export function BusinessProvider({
  business,
  children,
}: {
  business: Business;
  children: ReactNode;
}) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

/**
 * Access the current business data from any descendant of <BusinessProvider>.
 * Throws if called outside a provider — that's intentional; components
 * should always render inside a BusinessProvider.
 */
export function useBusiness(): Business {
  const biz = useContext(BusinessContext);
  if (!biz) {
    throw new Error(
      "useBusiness() called outside of <BusinessProvider>. Wrap your page in <BusinessProvider business={...}>.",
    );
  }
  return biz;
}
