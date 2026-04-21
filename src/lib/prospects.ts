import "server-only";
import { getStorage, readJson, writeJson } from "@/lib/storage";

const PROSPECTS_KEY = "prospects.json";

export type ProspectStatus = "found" | "contacted" | "interested" | "paid" | "delivered";

export const PIPELINE_STAGES: { status: ProspectStatus; label: string }[] = [
  { status: "found", label: "Found" },
  { status: "contacted", label: "Contacted" },
  { status: "interested", label: "Interested" },
  { status: "paid", label: "Paid" },
  { status: "delivered", label: "Delivered" },
];

export interface ProspectNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Prospect {
  slug: string;
  name: string;
  phone: string;
  address: string;
  status: ProspectStatus;
  notes: ProspectNote[];
  createdAt: string;
  updatedAt: string;
}

async function readAll(): Promise<Prospect[]> {
  const storage = await getStorage();
  return (await readJson<Prospect[]>(storage, PROSPECTS_KEY)) ?? [];
}

async function writeAll(prospects: Prospect[]): Promise<void> {
  const storage = await getStorage();
  await writeJson(storage, PROSPECTS_KEY, prospects);
}

export async function listProspects(): Promise<Prospect[]> {
  const all = await readAll();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProspect(slug: string): Promise<Prospect | null> {
  const all = await readAll();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function createProspect(prospect: Prospect): Promise<void> {
  const all = await readAll();
  all.push(prospect);
  await writeAll(all);
}

export async function updateProspect(slug: string, patch: Partial<Prospect>): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) throw new Error(`Prospect not found: ${slug}`);
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
}

export async function deleteProspect(slug: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((p) => p.slug !== slug));
}
