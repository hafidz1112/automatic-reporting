import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyReports, store, users } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: dailyReports.id,
        reportDate: dailyReports.reportDate,
        totalSales: dailyReports.totalSales,
        isPushedToWa: dailyReports.isPushedToWa,
        authorName: users.name,
        storeName: store.name,
      })
      .from(dailyReports)
      .leftJoin(users, eq(dailyReports.authorId, users.id))
      .leftJoin(store, eq(dailyReports.storeId, store.id))
      .orderBy(desc(dailyReports.reportDate))
      .limit(50); // Get latest 50 for performance

    return NextResponse.json({
      reports: rows,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
