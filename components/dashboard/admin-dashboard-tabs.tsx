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

import { ReportsManagement } from "./reports-management";

// --- Types & Helpers ---

type AnalyticsResponse = {
  summary: {
    totalSalesToday: number;
    totalReportsToday: number;
    totalMessagesSent: number;
  };
  chart: Array<{
    date: string;
    totalSales: number;
    reports: number;
    waSent: number;
  }>;
};

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const analyticsResult = await apiClient<AnalyticsResponse>("/dashboard/analytics");
        if (!mounted) return;
        setAnalytics(analyticsResult);
      } catch {
        if (!mounted) return;
        setError("Gagal memuat dashboard. Silakan refresh halaman.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

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
            <a href="/api/dashboard/export-csv">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </a>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col w-full max-w-full overflow-x-hidden">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-destructive mx-auto max-w-md">
            <CardContent className="pt-6 text-center text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="analytics" className="w-full space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 pb-2 backdrop-blur">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Laporan</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analytics" className="space-y-6 mt-0">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="min-w-0">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs font-medium uppercase truncate">Total Harian</CardDescription>
                    <CardTitle className="text-xl font-bold truncate">
                      {currency.format(analytics?.summary.totalSalesToday ?? 0)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-[10px] text-muted-foreground">
                    Berdasarkan laporan hari ini.
                  </CardContent>
                </Card>

                <Card className="min-w-0">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs font-medium uppercase truncate">Laporan Hari Ini</CardDescription>
                    <CardTitle className="text-xl font-bold">
                      {analytics?.summary.totalReportsToday ?? 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-[10px] text-muted-foreground">
                    Jumlah report masuk.
                  </CardContent>
                </Card>

                <Card className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs font-medium uppercase truncate">Total Pesan WA</CardDescription>
                    <CardTitle className="text-xl font-bold">
                      {analytics?.summary.totalMessagesSent ?? 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-[10px] text-muted-foreground">
                    Laporan terkirim ke WhatsApp.
                  </CardContent>
                </Card>
              </div>

              {/* Chart Card - Fully Responsive with ChartContainer */}
              <Card className="w-full overflow-hidden border-none sm:border">
                <CardHeader className="px-4 py-4 sm:p-6">
                  <CardTitle className="text-base sm:text-xl">Tren 7 Hari Terakhir</CardTitle>
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
        )}
      </div>
    </PageContainer>
  );
}