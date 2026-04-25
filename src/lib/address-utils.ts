/** Shared address parsing utilities used by Leads and Clients pages. */

export const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL",
  "IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE",
  "NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VT","VA","WA","WV","WI","WY",
]);

export function looksLikeStreet(s: string): boolean {
  return /^\d/.test(s) || /\b(st|ave|blvd|rd|dr|ln|ct|way|hwy|pkwy|suite|ste|tower|apt|unit|floor|bldg|room|lot)\b/i.test(s);
}

export function parseAddress(address?: string): { city: string; state: string; zip: string } {
  if (!address?.trim()) return { city: "", state: "", zip: "" };
  const parts = address.split(",").map((s) => s.trim());

  let state = "";
  let zip = "";
  let statePartIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const tokens = parts[i].split(/\s+/);
    const stateToken = tokens.find((t) => US_STATES.has(t.toUpperCase()));
    if (stateToken) {
      state = stateToken.toUpperCase();
      const zipToken = tokens.find((t) => /^\d{5}(-\d{4})?$/.test(t));
      zip = zipToken ? zipToken.slice(0, 5) : "";
      statePartIndex = i;
      break;
    }
  }

  let city = "";
  if (statePartIndex > 0) {
    for (let i = statePartIndex - 1; i >= 0; i--) {
      if (!looksLikeStreet(parts[i])) {
        city = parts[i];
        break;
      }
    }
  }

  return { city, state, zip };
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)].filter(Boolean).sort() as T[];
}
