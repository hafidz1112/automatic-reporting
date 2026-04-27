import { db } from "@/db";
import { dailyReports, store, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const sendWaSchema = z.object({
  reportId: z.string().uuid("reportId tidak valid"),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = sendWaSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Payload tidak valid" }, { status: 400 });
  }
  const { reportId } = parsed.data;

  const userRec = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!userRec?.storeId) {
    return Response.json(
      { success: false, error: "Akun ini belum memiliki outlet (store) yang ditetapkan." },
      { status: 400 }
    );
  }

  // Ambil data report dari Database
  const reportList = await db.select().from(dailyReports).where(eq(dailyReports.id, reportId)).limit(1);
  const report = reportList[0];

  if (!report) return new Response("Report not found", { status: 404 });
  if (report.storeId !== userRec.storeId) {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const storeList = await db.select().from(store).where(eq(store.id, report.storeId)).limit(1);
  const storeData = storeList[0];

  const date = report.reportDate ? new Date(report.reportDate) : new Date();
  const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Parsing JSON items 
  const itemOos = Array.isArray(report.itemOos) ? report.itemOos : [];
  const oosString = itemOos.length > 0 
    ? itemOos.map((item: Record<string, string>) => `- ${item.name}`).join('\n') 
    : "- Tidak ada";

  const totalSales = report.totalSales || 0;
  const targetSpd = storeData?.targetSpd || 0;
  const pencapaian = targetSpd > 0 ? ((totalSales / targetSpd) * 100).toFixed(0) : 0;

  // Coba meniru template
  const message = `*Laporan Sales Tanggal ${dateString}*

*Store: ${storeData?.name || '-'}*
Tahun Oprasional : ${storeData?.operationalYear || '-'}
Nama SE: ${storeData?.seName || '-'}
Jumlah Shift : 3 (Default)
Jumlah SA : ${storeData?.saCount || '-'}
Jam Operasional: ${storeData?.operationalHours || '-'}
Cluster Harga : ${storeData?.priceCluster || '-'}
PL Ytd (Data Dummy) : -
Kondisi store : *Sehat* 🟢

*Rincian Sales*
Groceries Bright  : Rp ${(report.salesGroceries || 0).toLocaleString('id-ID')}
Sales LPG           : Rp ${(report.salesLpg || 0).toLocaleString('id-ID')}
Pelumas                : Rp ${(report.salesPelumas || 0).toLocaleString('id-ID')}
Total Sales  (SPD) : Rp ${totalSales.toLocaleString('id-ID')}
Target SPD store   : Rp ${targetSpd.toLocaleString('id-ID')}
% Pencapaian Target : ${pencapaian}%

*Info SC & MD*
% Fulfillment PB = ${report.fulfillmentPb || 0}%
% Avg Fulfillment DC = ${report.avgFulfillmentDc || 0}%

*Item OOS Store Fast Moving*
${oosString}

*Stock LPG*
LPG 3kg : ${report.stockLpg3kg || 0}
LPG 5,5 kg : ${report.stockLpg5kg || 0}
LPG 12kg : ${report.stockLpg12kg || 0}

MTD
*Pencapaian Sales MTD (Belum ada data real time MTD)*
Total Sales MTD : Menunggu Kalkulasi
Sales Per Day MTD : Menunggu Kalkulasi

*Shrinkage Management*
(Losses, waste, own use)
Waste : ${(report.waste || 0).toLocaleString('id-ID')}
Losses : ${(report.losses || 0).toLocaleString('id-ID')}
Own use : -

*Need Support:*
${report.needSupport || '-'}

*Semangat! 💪🏻*
Have a *Bright* Day! 🌤️`;

  // Kirim ke Gateway (Contoh API Fonnte)
  try {
    if (!process.env.FONNTE_TOKEN || !process.env.WA_TUJUAN_LAPORAN) {
      return Response.json(
        { success: false, error: "Konfigurasi gateway belum lengkap." },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: process.env.FONNTE_TOKEN },
      body: new URLSearchParams({
        target: process.env.WA_TUJUAN_LAPORAN,
        message: message,
      }),
    });

    if (!res.ok) {
      return Response.json(
        { success: false, error: "Gateway menolak request pengiriman." },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Gateway Error" }, { status: 500 });
  }
}