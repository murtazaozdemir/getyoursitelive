// Navigation labels for the top-of-page anchors. Kept static because they
// correspond to section ids in the page layout itself.
export const navItems = ["home", "about", "services", "technicians", "contact"] as const;

// The "how it works" process strip — still static, same for every shop.
export const processSteps = [
  "Book (5 min)",
  "Inspect (30 min)",
  "Approve (15 min)",
  "Drive (same day)",
] as const;

// Everything else (stats, pricing, FAQ, why-us values) now lives per-business
// in `data/businesses/{slug}.json` and is edited via the admin.
