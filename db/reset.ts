import "dotenv/config";
import { db } from "./index";
import { dailyReports, storeReportSummaries, session, account, verification, users, store } from "./schema";

const resetData = async () => {
  console.log("Menghapus seluruh data...");

  try {
    await db.delete(storeReportSummaries);
    console.log("✅ store_report_summaries dihapus");

    await db.delete(dailyReports);
    console.log("✅ daily_reports dihapus");

    await db.delete(session);
    console.log("✅ session dihapus");

    await db.delete(account);
    console.log("✅ account dihapus");

    await db.delete(verification);
    console.log("✅ verification dihapus");

    await db.delete(users);
    console.log("✅ users dihapus");

    await db.delete(store);
    console.log("✅ stores dihapus");

    console.log("\n✅ Semua data berhasil dihapus! Siap untuk seeding ulang.");
  } catch (error) {
    console.error("❌ Gagal menghapus data:", error);
  }
};

resetData();
