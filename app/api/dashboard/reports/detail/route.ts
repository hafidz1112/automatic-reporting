import { NextResponse } from "next/server";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyReports, store, storeReportSummaries, users } from "@/db/schema";
import { auth } from "@/lib/auth";

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

async function loadPeriodSummary(params: {
  storeId: string;
  periodType: "mtd" | "ytd";
  periodKey: string;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const summary = await db.query.storeReportSummaries.findFirst({
    where: and(
      eq(storeReportSummaries.storeId, params.storeId),
      eq(storeReportSummaries.periodType, params.periodType),
      eq(storeReportSummaries.periodKey, params.periodKey)
    )
  });

  if (summary) return summary;

  const [totals] = await db
    .select({
      reportCount: sql<number>`count(*)`,
      totalSales: sql<number>`coalesce(sum(${dailyReports.totalSales}), 0)`,
      salesGroceries: sql<number>`coalesce(sum(${dailyReports.salesGroceries}), 0)`,
      salesLpg: sql<number>`coalesce(sum(${dailyReports.salesLpg}), 0)`,
      salesPelumas: sql<number>`coalesce(sum(${dailyReports.salesPelumas}), 0)`
    })
    .from(dailyReports)
    .where(
      and(
        eq(dailyReports.storeId, params.storeId),
        gte(dailyReports.reportDate, params.periodStart),
        lt(dailyReports.reportDate, params.periodEnd)
      )
    );

  return {
    id: `${params.storeId}-${params.periodType}-${params.periodKey}`,
    storeId: params.storeId,
    periodType: params.periodType,
    periodKey: params.periodKey,
    periodLabel: params.periodLabel,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    reportCount: Number(totals?.reportCount ?? 0),
    totalSales: Number(totals?.totalSales ?? 0),
    salesGroceries: Number(totals?.salesGroceries ?? 0),
    salesLpg: Number(totals?.salesLpg ?? 0),
    salesPelumas: Number(totals?.salesPelumas ?? 0),
    targetSpdSnapshot: 0,
    lastReportDate: params.periodEnd,
    updatedAt: new Date()
  };
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const [reportData] = await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.id, reportId))
      .limit(1);

    if (!reportData) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const storeData = await db.query.store.findFirst({
      where: eq(store.id, reportData.storeId)
    });

    const author = reportData.authorId
      ? await db.query.users.findFirst({
          where: eq(users.id, reportData.authorId)
        })
      : null;

    const reportDate = reportData.reportDate
      ? new Date(reportData.reportDate)
      : new Date();

    const dateString = reportDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const startOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfNextMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 1);
    startOfNextMonth.setHours(0, 0, 0, 0);
    const startOfYear = new Date(reportDate.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const startOfNextYear = new Date(reportDate.getFullYear() + 1, 0, 1);
    startOfNextYear.setHours(0, 0, 0, 0);

    const monthKey = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, "0")}`;
    const yearKey = `${reportDate.getFullYear()}`;

    const mtdSummary = await loadPeriodSummary({
      storeId: reportData.storeId,
      periodType: "mtd",
      periodKey: monthKey,
      periodLabel: `MTD ${getMonthLabel(reportDate)}`,
      periodStart: startOfMonth,
      periodEnd: startOfNextMonth
    });

    const ytdSummary = await loadPeriodSummary({
      storeId: reportData.storeId,
      periodType: "ytd",
      periodKey: yearKey,
      periodLabel: `YTD ${reportDate.getFullYear()}`,
      periodStart: startOfYear,
      periodEnd: startOfNextYear
    });

    const monthlyReports = await db
      .select({
        reportDate: dailyReports.reportDate,
        totalSales: dailyReports.totalSales
      })
      .from(dailyReports)
      .where(
        and(
          eq(dailyReports.storeId, reportData.storeId),
          gte(dailyReports.reportDate, startOfMonth),
          lt(dailyReports.reportDate, startOfNextMonth)
        )
      )
      .orderBy(dailyReports.reportDate);

    const salesDetailsList = monthlyReports
      .map((r) => {
        const d = new Date(r.reportDate);
        const fmtDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        return `${fmtDate} : ${formatCurrency(r.totalSales || 0)}`;
      })
      .join("\n");

    const monthlySummaries = await db
      .select()
      .from(storeReportSummaries)
      .where(
        and(
          eq(storeReportSummaries.storeId, reportData.storeId),
          eq(storeReportSummaries.periodType, "mtd")
        )
      )
      .orderBy(sql`${storeReportSummaries.periodKey} DESC`)
      .limit(6);

    const monthlySpdList = monthlySummaries
      .reverse()
      .map((s) => {
        const spd = s.reportCount > 0 ? s.totalSales / s.reportCount : 0;
        return `${s.periodLabel} : ${formatCurrency(Math.round(spd))}`;
      });

    const yearlySummaries = await db
      .select()
      .from(storeReportSummaries)
      .where(
        and(
          eq(storeReportSummaries.storeId, reportData.storeId),
          eq(storeReportSummaries.periodType, "ytd")
        )
      )
      .orderBy(sql`${storeReportSummaries.periodKey} DESC`)
      .limit(3);

    const yearlySpdList = yearlySummaries
      .reverse()
      .map((s) => {
        const spd = s.reportCount > 0 ? s.totalSales / s.reportCount : 0;
        return `${s.periodLabel} : ${formatCurrency(Math.round(spd))}`;
      });

    const mtdSpd = mtdSummary.reportCount > 0
      ? mtdSummary.totalSales / mtdSummary.reportCount
      : 0;

    const itemOos = Array.isArray(reportData.itemOos) ? reportData.itemOos : [];
    const oosString = itemOos.length > 0
      ? itemOos.map((item: Record<string, string>) => item.name).join(", ")
      : "Tidak ada item OOS";

    const totalSales = reportData.totalSales || 0;
    const targetSpd = storeData?.targetSpd || 0;
    const pencapaian = targetSpd > 0 ? ((totalSales / targetSpd) * 100).toFixed(0) : "0";

    return NextResponse.json({
      report: reportData,
      store: storeData,
      author: author ? { name: author.name, email: author.email } : null,
      computed: {
        dateString,
        totalSales,
        targetSpd,
        pencapaian: `${pencapaian}%`,
        healthStatus: reportData.isStoreHealthy === "store tidak sehat" ? "Tidak Sehat" : "Sehat",
        salesDetailsList,
        oosString,
        mtd: {
          label: mtdSummary.periodLabel,
          totalSales: mtdSummary.totalSales,
          spd: Math.round(mtdSpd)
        },
        ytd: ytdSummary,
        monthlySpdList,
        yearlySpdList
      }
    });
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
