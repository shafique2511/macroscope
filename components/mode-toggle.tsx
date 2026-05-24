"use client";

import { useTransition } from "react";
import { saveModePreference } from "@/app/(member)/dashboard/actions";

type Mode = "pro" | "beginner";

type ModeToggleProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const [, startTransition] = useTransition();

  function updateMode(nextMode: Mode) {
    onModeChange(nextMode);
    window.localStorage.setItem("macroscope-mode", nextMode);
    startTransition(() => {
      void saveModePreference(nextMode);
    });
  }

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <button
        className={
          mode === "pro"
            ? "rounded-md bg-[#0b0d12] px-3 py-1.5 text-sm font-semibold text-white"
            : "rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        }
        onClick={() => updateMode("pro")}
        type="button"
      >
        Pro Mode
      </button>
      <button
        className={
          mode === "beginner"
            ? "rounded-md bg-[#d71920] px-3 py-1.5 text-sm font-semibold text-white"
            : "rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        }
        onClick={() => updateMode("beginner")}
        type="button"
      >
        Beginner Mode
      </button>
    </div>
  );
}
