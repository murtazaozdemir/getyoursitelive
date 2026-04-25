const NOISE_WORDS = [
  "auto","repair","center","shop","garage","service","services",
  "automotive","motors","car","cars","mechanic","llc","inc","&","and",
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^-+|-+$/g, "");
}

export function domainSuggestions(name: string): string[] {
  const baseClean = slugify(name);
  if (!baseClean) return ["example.com", "exampleauto.com", "examplnj.com"];
  const words = name.toLowerCase().split(/\s+/);
  const core = words.filter(w => !NOISE_WORDS.includes(slugify(w))).map(slugify).join("") || baseClean;
  return [...new Set([
    `${baseClean}.com`,
    `${core}auto.com`,
    `${baseClean}nj.com`,
  ])].slice(0, 3);
}

export interface SellerInfo {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string | null;
  sellerAddress: string | null;
}

export function buildSellerInfo(user: Record<string, unknown>, sessionEmail: string): SellerInfo {
  const sellerName = (user.name as string) ?? "";
  const sellerEmail = ("email" in user) ? (user.email as string) : sessionEmail;
  const sellerPhone = ("phone" in user && user.phone) ? (user.phone as string) : null;
  const sellerAddressParts = [
    ("street" in user && user.street) ? user.street : null,
    ("city" in user && user.city) ? user.city : null,
    ("state" in user && user.state) ? user.state : null,
    ("zip" in user && user.zip) ? user.zip : null,
  ].filter(Boolean) as string[];
  const sellerAddress = sellerAddressParts.length > 0 ? sellerAddressParts.join(", ") : null;

  return { sellerName, sellerEmail, sellerPhone, sellerAddress };
}
