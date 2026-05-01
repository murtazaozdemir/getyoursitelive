import { getD1 } from "./db-d1";

export interface StateVisibility {
  state: string;
  name: string;
  visible: boolean;
}

/** Get all states with their visibility status */
export async function listStateVisibility(): Promise<StateVisibility[]> {
  try {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT state, name, visible FROM state_visibility ORDER BY name")
      .all<{ state: string; name: string; visible: number }>();
    if (results.length > 0) {
      return results.map((r) => ({ state: r.state, name: r.name, visible: r.visible === 1 }));
    }
  } catch {
    // Table doesn't exist yet
  }
  // Fallback: return all US states from the static list, all hidden
  const { US_STATES } = await import("./us-states");
  return US_STATES.map((s) => ({ state: s.abbr, name: s.name, visible: false }));
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
    // Table doesn't exist yet — show all states
    return new Set();
  }
}

/** Toggle a state's visibility */
export async function setStateVisible(state: string, visible: boolean): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE state_visibility SET visible = ? WHERE state = ?")
    .bind(visible ? 1 : 0, state)
    .run();
}
