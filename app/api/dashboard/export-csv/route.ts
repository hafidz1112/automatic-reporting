import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyReports, store, users } from "@/db/schema";
import { auth } from "@/lib/auth";

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: dailyReports.id,
      reportDate: dailyReports.reportDate,
      storeName: store.name,
      authorName: users.name,
      totalSales: dailyReports.totalSales,
      isPushedToWa: dailyReports.isPushedToWa,
    })
    .from(dailyReports)
    .leftJoin(store, eq(dailyReports.storeId, store.id))
    .leftJoin(users, eq(dailyReports.authorId, users.id))
    .orderBy(desc(dailyReports.reportDate));

  const headers = [
    "id",
    "report_date",
    "store_name",
    "author_name",
    "total_sales",
    "is_pushed_to_wa",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.reportDate ? new Date(row.reportDate).toISOString() : "",
        row.storeName ?? "",
        row.authorName ?? "",
        Number(row.totalSales ?? 0),
        row.isPushedToWa ? "yes" : "no",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const fileName = `dashboard-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
