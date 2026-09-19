import { useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "../lib/api";

export type PhotoFilter = {
  projectId?: string | null;
  userId?: string | null;
  /**
   * Personal captures: only photos not filed under a project yet. Drives the My captures page
   * on both clients — the server decides whose unfiled work that means per role.
   */
  unassigned?: boolean;
  /** Splits the personal page into stills, clips and scanned documents. */
  kind?: "photo" | "video" | "document";
  /**
   * Must stay in step with `tagEnum` in api/routes/photos.ts. "pickup" and "delivery" were added
   * there with the delivery-routes feature but never mirrored here, so the Teamspace tag filter
   * could not be typed against them.
   */
  tag?:
    | "general"
    | "before"
    | "after"
    | "issue"
    | "arrival"
    | "departure"
    | "pickup"
    | "delivery"
    | null;
  search?: string | null;
  limit?: number;
  offset?: number;
};

export function usePhotos(filter: PhotoFilter = {}) {
  return useQuery(orpc.photos.list.queryOptions({ input: filter, staleTime: 10_000 }));
}

/**
 * Same feed as `usePhotos`, paged in as the grid scrolls. A workspace with a few hundred
 * captures should not fetch and render every tile on first paint.
 */
export function useInfinitePhotos(filter: PhotoFilter = {}, pageSize = 36) {
  return useInfiniteQuery(
    orpc.photos.list.infiniteOptions({
      input: (offset: number) => ({ ...filter, limit: pageSize, offset }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((sum, page) => sum + page.photos.length, 0);
        return loaded < lastPage.total ? loaded : null;
      },
      staleTime: 10_000,
    }),
  );
}

export function usePhoto(id: string | null) {
  return useQuery(
    orpc.photos.get.queryOptions({
      input: { id: id ?? "" },
      enabled: Boolean(id),
      staleTime: 10_000,
    }),
  );
}

export function usePhotoStats() {
  return useQuery(orpc.photos.stats.queryOptions({ staleTime: 20_000 }));
}

export function usePhotoMap(projectId?: string | null) {
  return useQuery(orpc.photos.map.queryOptions({ input: { projectId }, staleTime: 20_000 }));
}

function usePhotoInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.photos.key() });
    queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
  };
}

/** Same cadence as the bell and the message badge — there are no websockets in this stack. */
const PULSE_MS = 15_000;

/**
 * Keeps every capture feed on the page current without a browser refresh.
 *
 * The problem this solves: a capture taken on a phone only reached an open dashboard when
 * something happened to refetch it. Mutations made in this tab invalidated the feeds, and
 * React Query refetches on window focus, so tabbing away and back worked — but an office
 * manager sitting on the Teamspace watching a crew work saw nothing arrive until they hit
 * reload, which is exactly when they are watching.
 *
 * Polling the feeds themselves would be wasteful: the grid is an infinite query, so a refetch
 * replays every page scrolled so far, and the map returns up to 400 presigned URLs. So one
 * cheap aggregate (`photos.pulse`) is polled instead, and the real feeds are invalidated only
 * when its token moves — a new capture, a delete, a filing, a seal. A quiet workspace costs
 * one small query every 15s and refetches nothing.
 *
 * Mounted once in `DashboardShell`, so it covers the Teamspace strip, My captures, a project's
 * grid, the map and the compare pool without each page wiring up its own timer.
 */
export function useLivePhotoFeed() {
  const queryClient = useQueryClient();
  const pulse = useQuery(
    orpc.photos.pulse.queryOptions({
      staleTime: 0,
      refetchInterval: PULSE_MS,
      // Deliberately NOT refetchIntervalInBackground: a hidden tab has no feed to keep fresh,
      // and React Query refetches on focus anyway, so the catch-up happens on return.
      retry: false,
    }),
  );

  const seen = useRef<string | null>(null);
  const token = pulse.data?.token ?? null;

  useEffect(() => {
    if (!token) return;
    // First token after mount is the state the page already loaded with — record it, don't
    // refetch everything for nothing.
    if (seen.current === null) {
      seen.current = token;
      return;
    }
    if (seen.current === token) return;
    seen.current = token;
    void queryClient.invalidateQueries({ queryKey: orpc.photos.list.key() });
    void queryClient.invalidateQueries({ queryKey: orpc.photos.stats.key() });
    void queryClient.invalidateQueries({ queryKey: orpc.photos.map.key() });
    // The compare page picks its pair out of the same captures, and a project's photo count
    // and cover come back with the project itself.
    void queryClient.invalidateQueries({ queryKey: orpc.photos.comparisons.list.key() });
    void queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
  }, [token, queryClient]);
}

export function useVerifyPhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.verify.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdatePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.update.mutationOptions({ onSuccess: invalidate }));
}

export function useMovePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.move.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePhotos() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.removeMany.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Builds a downloadable evidence file for one capture (certificate PDF or stamped JPEG) and
 * returns a presigned URL. It appends an "exported" event, so the photo's chain of custody is
 * refetched afterwards.
 */
export function usePhotoEvidence() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.photos.evidence.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.photos.key() }),
    }),
  );
}

export function useCreatePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.create.mutationOptions({ onSuccess: invalidate }));
}

export function useComparisons(projectId?: string | null) {
  return useQuery(
    orpc.photos.comparisons.list.queryOptions({ input: { projectId }, staleTime: 15_000 }),
  );
}

export function useCreateComparison() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.comparisons.create.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveComparison() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.comparisons.remove.mutationOptions({ onSuccess: invalidate }));
}
