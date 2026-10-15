"use client";

import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "hk-install-dismissed-at";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function saveDismissal() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|OPT\//i.test(ua);
  return isIos && isSafari;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Never show if already installed or dismissed recently
    if (isStandalone() || isDismissed()) return;

    if (isIosSafari()) {
      const timer = setTimeout(() => {
        setIsIos(true);
        setShow(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    saveDismissal();
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Install Hisab Kitab"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-surface border border-border rounded-2xl shadow-lg p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent shrink-0" />
          <p className="text-sm font-semibold text-text-primary">
            Install Hisab Kitab
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none -mt-0.5"
        >
          ×
        </button>
      </div>

      {isIos ? (
        <p className="text-xs text-text-muted">
          Tap{" "}
          <strong className="text-text-primary font-semibold">Share</strong>
          , then{" "}
          <strong className="text-text-primary font-semibold">
            Add to Home Screen
          </strong>
          .
        </p>
      ) : (
        <>
          <p className="text-xs text-text-muted">
            Install Hisab Kitab on your phone for quick access.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
