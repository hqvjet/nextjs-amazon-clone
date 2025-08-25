"use client";
import React, { useEffect, useState } from "react";
import { Stats } from "./components/stats";
import { CategorySales } from "./components/charts/category-sales";
import DailyRevenue from "./components/charts/daily-revenue/daily-revenue";
import { MonthlySales } from "./components/charts/monthly-sales";
import { RecentOrders } from "./components/recent-orders";
import { Card, CardHeader, CardBody, Button } from "@/components/ui/nextui-shim";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  username: string;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface RecentOrder {
  id: string;
  price: number;
  user: User;
}

interface TopCategory {
  id: string;
  name: string;
  revenue: number;
}

interface YearlySalesData {
  month: string;
  sales: number;
}

interface Stats {
  category: number;
  products: number;
  users: number;
  orders: number;
  revenue: number;
}

interface DashbordAPIResponseType {
  stats: Stats;
  revenueData: RevenueData[];
  recentOrders: RecentOrder[];
  top5Categories: TopCategory[];
  yearlySalesData: YearlySalesData[];
}

const Page = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [dailyRevenueData, setDailyRevenueData] = useState<RevenueData[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<TopCategory[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [monthlySales, setMonthlySales] = useState<YearlySalesData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await axios.get<DashbordAPIResponseType>(
          "http://localhost:5000/admin/dashboard/api"
        );

        if (response?.data?.stats) {
          setStats(response.data?.stats);
          setDailyRevenueData(response.data?.revenueData ?? []);
          setCategorySalesData(response?.data?.top5Categories ?? []);
          setRecentOrders(response.data?.recentOrders ?? []);
          setMonthlySales(response.data?.yearlySalesData ?? []);
        }
      } catch (error) {
        console.log(error);
      } finally {
        // Always render the dashboard shell even if API fails
        setIsLoaded(true);
      }
    };
    getDashboardData();
  }, []);

  return (
    <>
      {isLoaded && (
        <div className="m-10">
          <div className="flex justify-between gap-5">
            <Stats title="Total category" data={stats?.category ?? 0} />
            <Stats title="Total products" data={stats?.products ?? 0} />
            <Stats title="Total users" data={stats?.users ?? 0} />
            <Stats title="Total orders" data={stats?.orders ?? 0} />
            <Stats title="Total revenue" data={stats?.revenue ?? 0} />
          </div>

          {/* Quick Actions for common tasks, always available */}
          <div className="grid grid-cols-2 gap-10 mt-10">
            <Card className="h-full px-5">
              <CardHeader className="text-lg m-2 font-semibold">
                Quick Actions
              </CardHeader>
              <CardBody className="flex gap-4">
                <Button color="primary" onClick={() => router.push("/admin/category/add-category")}>Add Category</Button>
                <Button onClick={() => router.push("/admin/category/all-category")}>All Categories</Button>
                <Button color="primary" onClick={() => router.push("/admin/products/add-product")}>Add Product</Button>
                <Button onClick={() => router.push("/admin/products/all-products")}>All Products</Button>
              </CardBody>
            </Card>

            {/* Keep charts but they may be empty on first run or if API fails */}
            <div className="h-full min-h-[50vh]">
              <Card className="h-full px-5">
                <CardHeader className="text-lg m-2 font-semibold">
                  Daily Revenue
                </CardHeader>
                <DailyRevenue data={dailyRevenueData} />
              </Card>
            </div>
            <div className="h-full">
              <Card className="h-full px-5">
                <CardHeader className="text-lg m-2 font-semibold">
                  Monthly Sales
                </CardHeader>
                <MonthlySales data={monthlySales} />
              </Card>
            </div>
            <div className="h-full">
              <Card className="h-full px-5">
                <CardHeader className="text-lg m-2 font-semibold">
                  Sale by Category
                </CardHeader>
                <CategorySales data={categorySalesData} />
              </Card>
            </div>
            <RecentOrders data={recentOrders} />
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
