"use client";

import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load Sidebar to avoid pulling heavy icon + pro-sidebar libs on every page
const Sidebar = dynamic(() => import("@/components/admin/sidebar").then(m => m.Sidebar), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading...</div>,
});

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return !pathname.includes("admin/login") ? (
    <div className="flex min-h-[100vh] ">
      <Sidebar />
      <main className="flex-1 min-h-[100vh]">{children}</main>
    </div>
  ) : (
    children
  );
};

export default AdminLayout;
