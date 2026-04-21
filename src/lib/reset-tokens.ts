import "server-only";
import { getStorage, readJson, writeJson } from "@/lib/storage";

const TOKENS_KEY = "reset-tokens.json";
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface ResetToken {
  token: string;
  userId: string;
  expiresAt: string; // ISO
}

async function loadTokens(): Promise<ResetToken[]> {
  const storage = await getStorage();
  const tokens = await readJson<ResetToken[]>(storage, TOKENS_KEY);
  return tokens ?? [];
}

async function saveTokens(tokens: ResetToken[]): Promise<void> {
  const storage = await getStorage();
  await writeJson(storage, TOKENS_KEY, tokens);
}

export async function createResetToken(userId: string): Promise<string> {
  const tokens = await loadTokens();
  // Remove any existing tokens for this user
  const filtered = tokens.filter((t) => t.userId !== userId);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();

  filtered.push({ token, userId, expiresAt });
  await saveTokens(filtered);

  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const tokens = await loadTokens();
  const idx = tokens.findIndex((t) => t.token === token);
  if (idx === -1) return null;

  const entry = tokens[idx];
  if (new Date(entry.expiresAt) < new Date()) {
    // Expired — clean it up
    tokens.splice(idx, 1);
    await saveTokens(tokens);
    return null;
  }

  // Consume (single-use)
  tokens.splice(idx, 1);
  await saveTokens(tokens);

  return entry.userId;
}
