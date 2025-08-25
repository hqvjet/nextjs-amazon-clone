"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { addCategory } from "@/lib/api/category";
import { useAppStore } from "@/store/store";

export default function Page() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const { startLoading, stopLoading, isLoading, setToast } = useAppStore();
  const loadingKey = "addCategory";
  const [submitted, setSubmitted] = useState(false);
  const handleClick = async () => {
    if (submitted) return; // already succeeded
    if (!category.trim()) {
      setToast("Category name is required");
      return;
    }
    if (isLoading(loadingKey)) return;
    startLoading(loadingKey, "Đang tạo danh mục...");
    try {
      const result = await addCategory(category.trim());
      if (result) {
        setSubmitted(true);
        setToast("Category created");
        // slight delay to show toast
        setTimeout(() => router.push("/admin/category/all-category"), 300);
      } else {
        setToast("Failed to create category");
      }
    } finally {
      stopLoading(loadingKey);
    }
  };

  return (
    <div className="m-10 max-w-xl w-full">
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 shadow-sm p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">Add Category</h1>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Name
          </label>
          <input
            type="text"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category name"
          />
        </div>
        <button
          type="button"
          disabled={isLoading(loadingKey) || submitted}
          className="w-48 flex items-center justify-center gap-2 text-white bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-500/90 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-3"
          onClick={handleClick}
        >
          {isLoading(loadingKey) && (
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
          {isLoading(loadingKey)
            ? "Creating..."
            : submitted
            ? "Created"
            : "Add Category"}
        </button>
      </div>
    </div>
  );
}
