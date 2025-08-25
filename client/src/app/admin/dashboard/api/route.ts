import { NextResponse } from "next/server";

// Ensure this route is executed at request time on the Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Prisma removed. Provide placeholder stats or integrate real DB in future.

export async function GET(request: Request) {
  // Placeholder static data until real backend aggregation is wired.
  const stats = {
    category: 0,
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0,
  };
  return NextResponse.json({
    stats,
    revenueData: [],
    recentOrders: [],
    top5Categories: [],
    yearlySalesData: [],
    note: "Prisma removed: replace with real data source implementation",
  });
}
