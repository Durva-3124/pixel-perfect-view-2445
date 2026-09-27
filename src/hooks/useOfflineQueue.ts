import { useCallback, useEffect, useState } from "react";
import type { QueuedRequest } from "@/lib/reliefchain-data";

const STORAGE_KEY = "reliefchain.queue.v1";

function read(): QueuedRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

/**
 * Device-local request queue. Persisted in localStorage so field entries
 * survive reloads and browser restarts until they are synced.
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setQueue(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [queue, hydrated]);

  const enqueue = useCallback((request: QueuedRequest) => {
    setQueue((prev) => [request, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const markAllSynced = useCallback(() => {
    setQueue((prev) => prev.map((r) => ({ ...r, synced: true })));
  }, []);

  const clearSynced = useCallback(() => {
    setQueue((prev) => prev.filter((r) => !r.synced));
  }, []);

  const pending = queue.filter((r) => !r.synced);

  return { queue, pending, hydrated, enqueue, remove, markAllSynced, clearSynced };
}
