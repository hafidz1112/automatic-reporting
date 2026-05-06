"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { apiClient } from "@/lib/api-client";
import { signOut } from "@/lib/auth-client";
import { useIsMobile } from "@/hooks/use-mobile";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ReportsManagement } from "./reports-management";

// --- Types & Helpers ---

type AnalyticsResponse = {
  summary: {
    totalSalesToday: number;
    totalSalesGroceriesToday: number;
    totalSalesLpgToday: number;
    totalSalesPelumasToday: number;
    totalReportsToday: number;
    totalMessagesSent: number;
    totalSalesMTD: number;
    totalSalesYTD: number;
    totalUsers: number;
    totalStores: number;
  };
  chart: Array<{
    date: string;
    totalSales: number;
    reports: number;
    waSent: number;
  }>;
};

type Store = { id: string; name: string };

const chartConfig: ChartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "var(--primary)"
  },
  reports: {
    label: "Laporan",
    color: "var(--chart-2)"
  }
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short"
});

function parseChartDate(value: string): Date {
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyMatch.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

// --- Main Component ---

export function AdminDashboardTabs() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    async function loadStores() {
      try {
        const storesResult = await apiClient<{ stores: Store[] }>("/dashboard/stores");
        if (!mounted) return;
        setStores(storesResult.stores);
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    }
    void loadStores();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const analyticsResult = await apiClient<AnalyticsResponse>(
          `/dashboard/analytics?storeId=${selectedStore}`
        );
        if (!mounted) return;
        setAnalytics(analyticsResult);
      } catch {
        if (!mounted) return;
        setError("Gagal memuat dashboard. Silakan refresh halaman.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [selectedStore]);

  const chartData = useMemo(() => {
    const source = analytics?.chart ?? [];
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return source
      .map((item) => {
        const date = parseChartDate(item.date);
        return {
          ...item,
          parsedDate: date,
          label: dateFormat.format(date)
        };
      })
      .filter((item) => item.parsedDate >= startDate && item.parsedDate <= endDate)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .map(({ parsedDate, ...item }) => item);
  }, [analytics]);

  const onLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <PageContainer
      scrollable
      pageTitle="Dashboard"
      pageDescription="Analitik laporan harian."
      pageHeaderAction={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="destructive"
            onClick={onLogout}
            disabled={isSigningOut}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Logout
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
            <a href="/api/dashboard/export-stores">
              <Download className="mr-2 h-4 w-4" />
              Export Excel Store
            </a>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex min-h-75 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-red-500">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="analytics" className="space-y-4">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="overflow-x-auto pb-1 max-w-full">
              <TabsList className="inline-flex h-auto items-stretch gap-1">
                <TabsTrigger
                  value="analytics"
                  className="flex-1 px-3 py-2 text-xs sm:flex-none sm:text-sm"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex-1 px-3 py-2 text-xs sm:flex-none sm:text-sm"
                >
                  Laporan Harian
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="w-full sm:w-[220px]">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Store</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total User</CardDescription>
                  <CardTitle className="text-2xl">
                    {analytics?.summary.totalUsers ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  User terdaftar.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Store</CardDescription>
                  <CardTitle className="text-2xl">
                    {analytics?.summary.totalStores ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Store aktif.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Harian</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesToday ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Berdasarkan laporan masuk hari ini.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales Groceries (Hari Ini)</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesGroceriesToday ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Total sales groceries harian.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales LPG (Hari Ini)</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesLpgToday ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Total sales LPG harian.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales Pelumas (Hari Ini)</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesPelumasToday ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Total sales pelumas harian.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales MTD</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesMTD ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Bulan ini.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales YTD</CardDescription>
                  <CardTitle className="text-2xl">
                    {currency.format(analytics?.summary.totalSalesYTD ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Tahun ini.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Laporan Hari Ini</CardDescription>
                  <CardTitle className="text-2xl">
                    {analytics?.summary.totalReportsToday ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Jumlah report yang dibuat hari ini.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Pesan Terkirim</CardDescription>
                  <CardTitle className="text-2xl">
                    {analytics?.summary.totalMessagesSent ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Melalui WhatsApp.
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas 7 Hari Terakhir</CardTitle>
                <CardDescription>Grafik total sales dan laporan harian</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:px-6 sm:pb-6">
                <ChartContainer config={chartConfig} className="w-full">
                  <div className="relative w-full" style={{ height: isMobile ? '250px' : '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ 
                          top: 10, 
                          right: isMobile ? 5 : 10, 
                          left: isMobile ? 0 : 0, 
                          bottom: isMobile ? 5 : 0 
                        }}
                        barCategoryGap={isMobile ? "15%" : "20%"}
                        barGap={isMobile ? 2 : 4}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={isMobile ? 8 : 10}
                          interval={0}
                          tick={{ 
                            fontSize: isMobile ? 9 : 10,
                            angle: isMobile ? -15 : 0,
                            textAnchor: isMobile ? "end" : "middle",
                            dy: isMobile ? 5 : 0
                          }}
                          height={isMobile ? 40 : 30}
                        />
                        {!isMobile && (
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => currency.format(value)}
                            width={80}
                          />
                        )}
                        <ChartTooltip 
                          cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                          content={<ChartTooltipContent hideLabel />} 
                        />
                        <Bar
                          dataKey="totalSales"
                          fill="var(--color-totalSales)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={isMobile ? 20 : 40}
                        />
                        <Bar
                          dataKey="reports"
                          fill="var(--color-reports)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={isMobile ? 20 : 40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <ReportsManagement />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )
      }
    </PageContainer>
  )
}