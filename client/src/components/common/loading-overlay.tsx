"use client";
import React from "react";
import { useAppStore } from "@/store/store";

export const LoadingOverlay: React.FC = () => {
  const { anyLoading, latestMessage } = useAppStore();
  const show = anyLoading();
  if (!show) return null;
  const message = latestMessage();
  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center gap-3 rounded-lg bg-neutral-800/80 px-6 py-5 text-white shadow-xl">
        <svg
          className="animate-spin h-8 w-8 text-orange-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p className="text-sm font-medium tracking-wide text-center max-w-[240px]">
          {message || "Processing..."}
        </p>
      </div>
    </div>
  );
};
