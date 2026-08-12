"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mic } from "lucide-react";
import { useTransactionModal } from "@/components/client/TransactionModalProvider";
import { ExpenseCategory } from "@/types";

type VoiceState = "idle" | "recording" | "processing";

interface SavedExpenseToast {
  category: string;
  amount: number;
  expense: {
    _id: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod?: string;
    source?: string;
  };
}

const MAX_RECORDING_SECONDS = 20;
const TOAST_DISMISS_MS = 6000;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatRs(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function VoiceLogButton() {
  const router = useRouter();
  const { openModal } = useTransactionModal();
  const [state, setState] = useState<VoiceState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<SavedExpenseToast | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const dismissSuccessToast = useCallback(() => {
    clearToastTimer();
    setSuccessToast(null);
  }, [clearToastTimer]);

  const showSuccessToast = useCallback(
    (toast: SavedExpenseToast) => {
      clearToastTimer();
      setErrorToast(null);
      setSuccessToast(toast);
      toastTimerRef.current = setTimeout(() => {
        setSuccessToast(null);
        toastTimerRef.current = null;
      }, TOAST_DISMISS_MS);
    },
    [clearToastTimer]
  );

  const showErrorToast = useCallback(
    (text: string) => {
      clearToastTimer();
      setSuccessToast(null);
      setErrorToast(text);
      toastTimerRef.current = setTimeout(() => {
        setErrorToast(null);
        toastTimerRef.current = null;
      }, TOAST_DISMISS_MS);
    },
    [clearToastTimer]
  );

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const showTemporaryMessage = useCallback((text: string, ms = 2000) => {
    setMessage(text);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(null), ms);
  }, []);

  const handleEditSavedExpense = useCallback(() => {
    if (!successToast) return;

    const { expense } = successToast;
    dismissSuccessToast();
    openModal("expense", {
      _id: expense._id,
      type: "expense",
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note,
      paymentMethod: expense.paymentMethod,
      source: expense.source,
    });
  }, [dismissSuccessToast, openModal, successToast]);

  const processRecording = useCallback(
    async (blob: Blob) => {
      setState("processing");

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const res = await fetch("/api/voice", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          showTemporaryMessage("Something went wrong — try again");
          setState("idle");
          return;
        }

        const { transcript, extracted } = data.data as {
          transcript: string | null;
          extracted: {
            amount: number | null;
            category: ExpenseCategory;
            note: string;
          } | null;
        };

        if (!transcript) {
          showTemporaryMessage("Couldn't hear anything — try again");
          setState("idle");
          return;
        }

        const today = new Date().toISOString().slice(0, 10);

        if (extracted?.amount != null) {
          const saveRes = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: extracted.amount,
              category: extracted.category,
              note: extracted.note || transcript,
              date: today,
              source: "voice",
            }),
          });

          const saveData = await saveRes.json();

          if (!saveRes.ok || !saveData.success) {
            showErrorToast("Couldn't save — try again");
            setState("idle");
            return;
          }

          const expense = saveData.data;
          router.refresh();
          showSuccessToast({
            category: extracted.category,
            amount: extracted.amount,
            expense: {
              _id: String(expense._id),
              amount: expense.amount,
              category: expense.category,
              date: expense.date,
              note: expense.note || undefined,
              paymentMethod: expense.paymentMethod || undefined,
              source: expense.source || "voice",
            },
          });
          setState("idle");
          return;
        }

        if (extracted) {
          openModal("expense", {
            category: extracted.category,
            note: extracted.note || transcript,
            date: today,
            source: "voice",
          });
        } else {
          openModal("expense", {
            note: transcript,
            date: today,
            source: "voice",
          });
        }

        setState("idle");
      } catch {
        showTemporaryMessage("Something went wrong — try again");
        setState("idle");
      }
    },
    [openModal, router, showErrorToast, showSuccessToast, showTemporaryMessage]
  );

  const stopRecording = useCallback(() => {
    clearTimers();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, [clearTimers]);

  const startRecording = useCallback(async () => {
    setMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      showTemporaryMessage("Microphone not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        if (blob.size > 0) {
          processRecording(blob);
        } else {
          showTemporaryMessage("Couldn't hear anything — try again");
          setState("idle");
        }
      };

      recorder.start();
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      autoStopRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      showTemporaryMessage("Microphone access needed for voice logging");
      setState("idle");
    }
  }, [processRecording, showTemporaryMessage, stopRecording, stopStream]);

  const handleClick = () => {
    if (state === "idle") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
      clearToastTimer();
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
      stopStream();
    };
  }, [clearTimers, clearToastTimer, stopStream]);

  return (
    <>
      <div className="relative flex flex-col items-start gap-1">
        {state === "recording" ? (
          <button
            type="button"
            onClick={handleClick}
            aria-label="Stop voice recording"
            className="inline-flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-surface hover:bg-background text-text-primary shadow-xs cursor-pointer transition-colors"
          >
            <motion.span
              aria-hidden="true"
              className="w-3 h-3 rounded-full bg-expense shrink-0"
              animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-sm tabular-nums">{formatElapsed(elapsed)}</span>
            <span className="text-text-muted text-xs">tap to stop</span>
          </button>
        ) : state === "processing" ? (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-surface text-text-muted shadow-xs opacity-80 cursor-not-allowed"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Listening...
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            aria-label="Log expense by voice"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-surface hover:bg-background text-text-primary shadow-xs cursor-pointer transition-colors"
          >
            <Mic className="w-4 h-4" />
            Voice Log
          </button>
        )}

        {message && (
          <p className="absolute top-full left-0 mt-1.5 text-xs text-text-muted whitespace-nowrap z-10">
            {message}
          </p>
        )}
      </div>

      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-text-primary text-white text-sm font-medium rounded-xl shadow-lg animate-fade-in-up max-w-[calc(100vw-2rem)]"
        >
          <span className="truncate">
            Added: {successToast.category} — Rs. {formatRs(successToast.amount)}
          </span>
          <button
            type="button"
            onClick={handleEditSavedExpense}
            className="shrink-0 text-accent font-semibold hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>
      )}

      {errorToast && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-text-primary text-expense text-sm font-medium rounded-xl shadow-lg animate-fade-in-up max-w-[calc(100vw-2rem)]"
        >
          {errorToast}
        </div>
      )}
    </>
  );
}
