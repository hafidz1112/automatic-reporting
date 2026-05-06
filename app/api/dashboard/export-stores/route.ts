import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { store } from "@/db/schema";
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
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.select().from(store).orderBy(desc(store.createdAt));

  const headers = [
    "Branch Name",
    "SE",
    "CLUSTER",
    "Jumlah SA",
    "Jam Operasi",
    "Tahun Operasi",
    "Target SPD"
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.seName ?? "",
        row.priceCluster ?? "",
        row.saCount ?? "",
        row.operationalHours ?? "",
        row.operationalYear ?? "",
        row.targetSpd
          ? `Rp ${Number(row.targetSpd).toLocaleString("id-ID")}`
          : "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const fileName = `data-store-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
