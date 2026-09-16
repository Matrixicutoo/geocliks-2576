import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * Office notes — the right-hand panel on the Teamspace and Routes dashboards.
 *
 * `enabled` matters on the list: the panel is hidden from field crew and drivers, and firing a
 * query the server would refuse with a 403 on every dashboard load is noise in the console and
 * in the logs. Pass `enabled: canUseNotes(role)` from the caller.
 */

export type NoteBoard = "field" | "delivery";

export function useNotes(
  board: NoteBoard,
  opts?: { status?: "open" | "archived"; enabled?: boolean },
) {
  return useQuery(
    orpc.notes.list.queryOptions({
      input: { board, status: opts?.status ?? "open" },
      staleTime: 15_000,
      enabled: opts?.enabled ?? true,
    }),
  );
}

function useNotesInvalidate() {
  const queryClient = useQueryClient();
  // One key for the whole feature: archiving moves a note between two cached lists, so
  // invalidating just the one it came from would leave the other stale.
  return () => queryClient.invalidateQueries({ queryKey: orpc.notes.key() });
}

export function useCreateNote() {
  const invalidate = useNotesInvalidate();
  return useMutation(orpc.notes.create.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateNote() {
  const invalidate = useNotesInvalidate();
  return useMutation(orpc.notes.update.mutationOptions({ onSuccess: invalidate }));
}

/** Archive or restore — the row survives. */
export function useSetNoteStatus() {
  const invalidate = useNotesInvalidate();
  return useMutation(orpc.notes.setStatus.mutationOptions({ onSuccess: invalidate }));
}

/** Hard delete, manager and above. */
export function useRemoveNote() {
  const invalidate = useNotesInvalidate();
  return useMutation(orpc.notes.remove.mutationOptions({ onSuccess: invalidate }));
}
