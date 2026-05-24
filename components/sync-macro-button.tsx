"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SyncState = "idle" | "syncing" | "success" | "error";

export function SyncMacroButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setState("syncing");
    setMessage(null);

    const response = await fetch("/api/admin/sync-macro", {
      method: "POST",
    });
    const payload = (await response.json()) as {
      error?: string;
      result?: {
        recordsSynced: number;
        failedCount: number;
        status: string;
        cycleResult: {
          cyclePhase: string;
        };
      };
    };

    if (!response.ok) {
      setState("error");
      setMessage(payload.error ?? "Unable to sync macro data.");
      return;
    }

    setState("success");
    setMessage(
      `${payload.result?.status ?? "completed"}: synced ${
        payload.result?.recordsSynced ?? 0
      } indicators with ${payload.result?.failedCount ?? 0} errors. Draft phase: ${
        payload.result?.cycleResult.cyclePhase ?? "Pending review"
      }.`,
    );
    router.refresh();
  }

  return (
    <div>
      <button
        className="rounded-md bg-[#d71920] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b9151b] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "syncing"}
        onClick={handleSync}
        type="button"
      >
        {state === "syncing" ? "Syncing Macro Data..." : "Sync Latest Macro Data"}
      </button>
      {message ? (
        <p
          className={
            state === "error"
              ? "mt-3 text-sm font-medium text-red-700"
              : "mt-3 text-sm font-medium text-emerald-700"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
