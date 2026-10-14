"use client";

import { useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";

interface DashboardLiveSyncProps {
  month: string;
}

const NORMAL_POLL_INTERVAL_MS = 20_000;
const BACKOFF_POLL_INTERVAL_MS = 60_000;
const DEBOUNCE_WINDOW_MS = 5_000;

export function DashboardLiveSync({ month }: DashboardLiveSyncProps) {
  const router = useRouter();

  const signatureRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const hasAuthErrorRef = useRef(false);
  const hasLoggedErrorRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when month prop changes
    signatureRef.current = null;
    consecutiveFailuresRef.current = 0;
    hasAuthErrorRef.current = false;
    hasLoggedErrorRef.current = false;
    lastCheckTimeRef.current = 0;

    let isMounted = true;

    const clearScheduledTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = () => {
      if (!isMounted || hasAuthErrorRef.current) return;
      clearScheduledTimer();

      const delay =
        consecutiveFailuresRef.current >= 3
          ? BACKOFF_POLL_INTERVAL_MS
          : NORMAL_POLL_INTERVAL_MS;

      timerRef.current = setTimeout(() => {
        checkPulse();
      }, delay);
    };

    const checkPulse = async () => {
      if (!isMounted || hasAuthErrorRef.current || isFetchingRef.current) return;

      // Only check when tab is visible
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastCheckTimeRef.current < DEBOUNCE_WINDOW_MS) {
        return;
      }
      lastCheckTimeRef.current = now;

      isFetchingRef.current = true;
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const res = await fetch(`/api/dashboard/pulse?month=${encodeURIComponent(month)}`, {
          signal: abortController.signal,
          cache: "no-store",
        });

        if (!isMounted) return;

        if (res.status === 401) {
          hasAuthErrorRef.current = true;
          if (!hasLoggedErrorRef.current) {
            console.warn("[DashboardLiveSync] 401 Unauthorized, stopping live sync.");
            hasLoggedErrorRef.current = true;
          }
          return;
        }

        if (!res.ok) {
          consecutiveFailuresRef.current += 1;
          if (!hasLoggedErrorRef.current) {
            console.warn(`[DashboardLiveSync] Pulse failed with HTTP ${res.status}.`);
            hasLoggedErrorRef.current = true;
          }
          return;
        }

        const json = await res.json();
        if (!json.success || !json.data?.signature) {
          consecutiveFailuresRef.current += 1;
          return;
        }

        // On success, reset failures and logged state
        consecutiveFailuresRef.current = 0;
        hasLoggedErrorRef.current = false;

        const newSignature = json.data.signature as string;

        if (signatureRef.current === null) {
          // Initial mount or month reset baseline
          signatureRef.current = newSignature;
        } else if (signatureRef.current !== newSignature) {
          signatureRef.current = newSignature;
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        consecutiveFailuresRef.current += 1;
        if (!hasLoggedErrorRef.current) {
          console.warn("[DashboardLiveSync] Network error during pulse check.");
          hasLoggedErrorRef.current = true;
        }
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
          scheduleNext();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkPulse();
      }
    };

    const handleFocus = () => {
      checkPulse();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Initial check on mount
    checkPulse();

    return () => {
      isMounted = false;
      clearScheduledTimer();
      abortControllerRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [month, router]);

  return null;
}
