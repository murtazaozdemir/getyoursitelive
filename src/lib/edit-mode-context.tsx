"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { saveBusinessAction } from "@/app/admin/actions";
import type { Business } from "@/lib/business-types";

/**
 * Edit-mode context.
 *
 * Wrap the homepage in <EditModeProvider> to enable WYSIWYG editing.
 * Child components then call useEditMode() to:
 *   - check whether edit affordances should render
 *   - read the current business state
 *   - call updateField() / updateList() to commit changes
 *
 * Saves happen on every commit (optimistic UI). A top-level save indicator
 * tells the user whether their latest change landed.
 */

export type SaveState = "idle" | "saving" | "saved" | "error";

interface EditModeValue {
  isEdit: boolean;
  business: Business;
  saveState: SaveState;
  errorMessage: string | null;
  /** Update a top-level field on the business object (e.g. "hero", "about"). */
  updateField: <K extends keyof Business>(key: K, value: Business[K]) => void;
  /** Update multiple top-level fields atomically in a single save. */
  updateFields: (patch: Partial<Business>) => void;
}

const EditModeContext = createContext<EditModeValue | null>(null);

export function EditModeProvider({
  business: initialBusiness,
  children,
}: {
  business: Business;
  children: ReactNode;
}) {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Holds the originally-loaded slug — used as the addressing key for
  // saveBusinessAction even if the user later renames their slug.
  const originalSlugRef = useRef(initialBusiness.slug);
  // Holds the latest business snapshot for save calls without depending
  // on stale closures.
  const latestRef = useRef(initialBusiness);

  const commitSave = useCallback((next: Business) => {
    latestRef.current = next;
    setBusiness(next);
    setSaveState("saving");
    setErrorMessage(null);

    void (async () => {
      const res = await saveBusinessAction(originalSlugRef.current, next);
      // A newer save superseded this one — but if it failed, surface the error
      // rather than silently discarding it.
      if (latestRef.current !== next) {
        if (!res.ok) {
          setSaveState("error");
          setErrorMessage(res.error);
        }
        return;
      }
      if (res.ok) {
        setSaveState("saved");
        window.setTimeout(() => {
          if (latestRef.current === next) setSaveState("idle");
        }, 1500);
      } else {
        setSaveState("error");
        setErrorMessage(res.error);
      }
    })();
  }, []);

  const updateField = useCallback(
    <K extends keyof Business>(key: K, value: Business[K]) => {
      commitSave({ ...latestRef.current, [key]: value });
    },
    [commitSave],
  );

  const updateFields = useCallback(
    (patch: Partial<Business>) => {
      commitSave({ ...latestRef.current, ...patch });
    },
    [commitSave],
  );

  return (
    <EditModeContext.Provider
      value={{
        isEdit: true,
        business,
        saveState,
        errorMessage,
        updateField,
        updateFields,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

/**
 * Use inside an EditModeProvider. Returns null when not inside one — callers
 * should treat null as "not in edit mode" and render the normal read-only UI.
 */
export function useEditMode(): EditModeValue | null {
  return useContext(EditModeContext);
}
