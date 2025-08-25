"use client";
import React from "react";
import { useAppStore } from "@/store/store";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingKey: string;
  loadingText?: string;
  normalText: string;
  startMessage?: string; // message to show in overlay
}

export const ButtonWithLoader: React.FC<Props> = ({
  loadingKey,
  loadingText,
  normalText,
  startMessage,
  onClick,
  className = "",
  disabled,
  ...rest
}) => {
  const { isLoading, startLoading, stopLoading } = useAppStore();
  const loading = isLoading(loadingKey);
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    if (startMessage) startLoading(loadingKey, startMessage);
    try {
      await onClick?.(e);
    } finally {
      if (startMessage) stopLoading(loadingKey);
    }
  };
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium bg-orange-400 text-white hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
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
      )}
      {loading ? loadingText || normalText : normalText}
    </button>
  );
};
