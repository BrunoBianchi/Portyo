import { useCallback, useEffect, useRef, useState } from "react";
import type { Bio } from "~/types/bio";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseDesignEditorOptions {
  /** The current bio from context */
  bio: Bio | null;
  /** User object passed to blocksToHtml for SSR HTML generation */
  user: any;
  /** Context's updateBio(id, payload) */
  updateBio: (id: string, payload: Partial<Bio>) => Promise<any>;
  /** Default debounce delay in ms for field updates (default: 350) */
  delay?: number;
  /** Longer debounce for range/slider inputs (default: 650) */
  rangeDelay?: number;
  /**
   * Whether to regenerate static HTML via blocksToHtml on each save.
   * When BioRenderer is used for preview, this can be set to false
   * for the editor and only kept true for the standalone design page
   * (which still needs it until fully migrated).
   *
   * Default: true (backward compatible)
   */
  regenerateHtml?: boolean;
}

export interface UseDesignEditorReturn {
  /**
   * The "live" bio that reflects pending (unsaved) changes.
   * Use this for preview rendering — it updates instantly on user input.
   */
  liveBio: Bio | null;
  /**
   * Update a single design field. Batches with other pending changes and
   * debounces the save.
   */
  updateField: <K extends keyof Bio>(field: K, value: Bio[K]) => void;
  /**
   * Same as updateField but with a longer debounce — ideal for range/slider
   * inputs that fire rapidly.
   */
  updateRangeField: <K extends keyof Bio>(field: K, value: Bio[K]) => void;
  /**
   * Update multiple design fields at once. Batches with other pending
   * changes and debounces the save.
   */
  updateFields: (payload: Partial<Bio>) => void;
  /**
   * True while a save is in flight.
   */
  isSaving: boolean;
  /**
   * True when there are accumulated changes not yet persisted.
   */
  isDirty: boolean;
  /**
   * Immediately flush all pending changes (skip debounce).
   * Returns a promise that resolves when the save completes.
   */
  flush: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDesignEditor({
  bio,
  user,
  updateBio,
  delay = 350,
  rangeDelay = 650,
  regenerateHtml = true,
}: UseDesignEditorOptions): UseDesignEditorReturn {
  // ── Refs for latest values (eliminate stale closures) ────────────────
  const bioRef = useRef(bio);
  const userRef = useRef(user);
  const updateBioRef = useRef(updateBio);
  const regenerateHtmlRef = useRef(regenerateHtml);

  useEffect(() => { bioRef.current = bio; }, [bio]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { updateBioRef.current = updateBio; }, [updateBio]);
  useEffect(() => { regenerateHtmlRef.current = regenerateHtml; }, [regenerateHtml]);

  // ── Pending payload accumulator ─────────────────────────────────────
  const pendingPayloadRef = useRef<Partial<Bio>>({});
  const saveTimeoutRef = useRef<number | null>(null);

  // ── Local "draft" state for instant preview ─────────────────────────
  const [draftBio, setDraftBio] = useState<Bio | null>(bio);
  const [isSaving, setIsSaving] = useState(false);

  // Keep draftBio in sync when the context bio changes from outside
  // (e.g. after a successful save propagates through context)
  useEffect(() => {
    setDraftBio(bio);
  }, [bio]);

  // The bio used for rendering — reflects uncommitted changes instantly
  const liveBio = draftBio ?? bio;

  // ── Core commit function ────────────────────────────────────────────
  const commit = useCallback(async () => {
    const currentBio = bioRef.current;
    if (!currentBio) return;

    const payload = pendingPayloadRef.current;
    if (Object.keys(payload).length === 0) return;

    // Snapshot & clear pending
    pendingPayloadRef.current = {};
    setIsSaving(true);

    try {
      if (regenerateHtmlRef.current) {
        // Merge payload into bio for HTML generation
        const updatedBio = { ...currentBio, ...payload };
        const { blocksToHtml } = await import("~/services/html-generator");
        const html = await blocksToHtml(
          updatedBio.blocks || [],
          userRef.current,
          updatedBio
        );
        await updateBioRef.current(currentBio.id, { ...payload, html });
      } else {
        await updateBioRef.current(currentBio.id, payload);
      }
    } catch (error) {
      console.error("[useDesignEditor] Save failed:", error);
      // Re-queue the payload so the user doesn't lose changes
      pendingPayloadRef.current = {
        ...payload,
        ...pendingPayloadRef.current,
      };
    } finally {
      setIsSaving(false);
    }
  }, []); // stable — uses only refs

  // ── Schedule a debounced commit ─────────────────────────────────────
  const scheduleCommit = useCallback(
    (ms: number) => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(commit, ms);
    },
    [commit]
  );

  // ── Public API ──────────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof Bio>(field: K, value: Bio[K]) => {
      const currentBio = bioRef.current;
      if (!currentBio) return;

      // Accumulate in pending payload
      pendingPayloadRef.current = {
        ...pendingPayloadRef.current,
        [field]: value,
      } as Partial<Bio>;

      // Update draft for instant preview
      setDraftBio((prev) => {
        const base = prev ?? currentBio;
        return { ...base, [field]: value } as Bio;
      });

      scheduleCommit(delay);
    },
    [delay, scheduleCommit]
  );

  const updateRangeField = useCallback(
    <K extends keyof Bio>(field: K, value: Bio[K]) => {
      const currentBio = bioRef.current;
      if (!currentBio) return;

      pendingPayloadRef.current = {
        ...pendingPayloadRef.current,
        [field]: value,
      } as Partial<Bio>;

      setDraftBio((prev) => {
        const base = prev ?? currentBio;
        return { ...base, [field]: value } as Bio;
      });

      scheduleCommit(rangeDelay);
    },
    [rangeDelay, scheduleCommit]
  );

  const updateFields = useCallback(
    (payload: Partial<Bio>) => {
      const currentBio = bioRef.current;
      if (!currentBio) return;

      pendingPayloadRef.current = {
        ...pendingPayloadRef.current,
        ...payload,
      };

      setDraftBio((prev) => {
        const base = prev ?? currentBio;
        return { ...base, ...payload } as Bio;
      });

      scheduleCommit(delay);
    },
    [delay, scheduleCommit]
  );

  const flush = useCallback(async () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await commit();
  }, [commit]);

  const isDirty = Object.keys(pendingPayloadRef.current).length > 0;

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      // Best-effort flush on unmount (fire-and-forget)
      if (Object.keys(pendingPayloadRef.current).length > 0) {
        commit();
      }
    };
  }, [commit]);

  return {
    liveBio,
    updateField,
    updateRangeField,
    updateFields,
    isSaving,
    isDirty,
    flush,
  };
}
