import { getD1 } from "./db-d1";

export interface StateVisibility {
  state: string;
  name: string;
  visible: boolean;
}

/** Get all states with their visibility status */
export async function listStateVisibility(): Promise<StateVisibility[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT state, name, visible FROM state_visibility ORDER BY name")
    .all<{ state: string; name: string; visible: number }>();
  return results.map((r) => ({ state: r.state, name: r.name, visible: r.visible === 1 }));
}

/** Get only the visible state abbreviations */
export async function getVisibleStates(): Promise<Set<string>> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT state FROM state_visibility WHERE visible = 1")
    .all<{ state: string }>();
  return new Set(results.map((r) => r.state));
}

/** Toggle a state's visibility */
export async function setStateVisible(state: string, visible: boolean): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE state_visibility SET visible = ? WHERE state = ?")
    .bind(visible ? 1 : 0, state)
    .run();
}
