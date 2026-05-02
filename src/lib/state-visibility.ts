import { getD1 } from "./db-d1";

export interface StateVisibility {
  state: string;
  name: string;
  visible: boolean;
}

/** Ensure the state_visibility table exists and is seeded with all US states */
async function ensureTable(): Promise<void> {
  const db = await getD1();
  try {
    // Check if table has data
    const check = await db
      .prepare("SELECT COUNT(*) as cnt FROM state_visibility")
      .first<{ cnt: number }>();
    if (check && check.cnt > 0) return; // Already seeded
  } catch {
    // Table doesn't exist — create it
    console.log("[state-visibility] creating state_visibility table");
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS state_visibility (
           state TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           visible INTEGER NOT NULL DEFAULT 0
         )`
      )
      .run();
  }

  // Seed with all US states (all hidden by default)
  console.log("[state-visibility] seeding state_visibility with US states");
  const { US_STATES } = await import("./us-states");
  for (const s of US_STATES) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO state_visibility (state, name, visible) VALUES (?, ?, 0)`
      )
      .bind(s.abbr, s.name)
      .run();
  }
}

/** Get states that actually have leads in the DB */
async function getStatesWithLeads(): Promise<Set<string>> {
  try {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT DISTINCT UPPER(state) as state FROM prospects WHERE state IS NOT NULL AND state != ''")
      .all<{ state: string }>();
    const states = new Set<string>(results.map((r) => r.state));
    console.log(`[state-visibility] found ${states.size} states with leads`);
    return states;
  } catch (e) {
    console.error(`[state-visibility] getStatesWithLeads error=${e instanceof Error ? e.message : String(e)}`);
    return new Set();
  }
}

/** Get all states that have leads, with their visibility status */
export async function listStateVisibility(): Promise<StateVisibility[]> {
  try {
    await ensureTable();
    const db = await getD1();
    const statesWithLeads = await getStatesWithLeads();
    const { results } = await db
      .prepare("SELECT state, name, visible FROM state_visibility ORDER BY name")
      .all<{ state: string; name: string; visible: number }>();
    // Only show states that have actual leads data
    return results
      .filter((r) => statesWithLeads.has(r.state))
      .map((r) => ({ state: r.state, name: r.name, visible: r.visible === 1 }));
  } catch (e) {
    console.error(`[state-visibility] listStateVisibility error=${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}

/** Get only the visible state abbreviations. Returns empty set if table doesn't exist yet. */
export async function getVisibleStates(): Promise<Set<string>> {
  try {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT state FROM state_visibility WHERE visible = 1")
      .all<{ state: string }>();
    return new Set(results.map((r) => r.state));
  } catch {
    return new Set();
  }
}

/** Toggle a state's visibility */
export async function setStateVisible(state: string, visible: boolean): Promise<void> {
  await ensureTable();
  const db = await getD1();
  console.log(`[state-visibility] setStateVisible state=${state} visible=${visible}`);
  await db
    .prepare(
      `INSERT INTO state_visibility (state, name, visible) VALUES (?, ?, ?)
       ON CONFLICT(state) DO UPDATE SET visible = excluded.visible`
    )
    .bind(state, state, visible ? 1 : 0)
    .run();
}
