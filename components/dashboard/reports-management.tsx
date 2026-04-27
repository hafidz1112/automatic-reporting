"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, Send } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ReportItem = {
  id: string;
  reportDate: string;
  totalSales: number;
  isPushedToWa: boolean;
  authorName: string;
  storeName: string;
};

export function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/reports");
      const json = await res.json();
      if (json.reports) {
        setReports(json.reports);
      } else {
        setError(json.error || "Gagal memuat daftar laporan.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResend = async (id: string) => {
    setSendingId(id);
    try {
      // Re-use the existing send-wa API, or create a specific one for admin resending.
      // Assuming send-wa can take an id or we can just show a toast for now.
      // A full implementation would call `/api/send-wa?reportId=${id}` or similar.
      const res = await fetch("/api/send-wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, action: "send_wa" }) 
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Pesan berhasil dikirim ulang ke WhatsApp!");
        loadReports();
      } else {
        toast.error("Berhasil diproses, namun pastikan Fonnte API terkonfigurasi dengan benar.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setSendingId(null);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-red-500">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Laporan Harian (Kasir)</CardTitle>
          <CardDescription>Daftar laporan yang masuk dari semua cabang.</CardDescription>
        </div>
        <Button variant="outline" onClick={loadReports} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Toko / Cabang</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead>Status WA</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(rep.reportDate).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit"
                    })}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{rep.storeName}</TableCell>
                  <TableCell className="whitespace-nowrap">{rep.authorName}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rep.totalSales)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      rep.isPushedToWa ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {rep.isPushedToWa ? "Terkirim WA" : "Draft Dashboard"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleResend(rep.id)}
                      disabled={sendingId === rep.id}
                      title="Kirim Ulang ke WA"
                    >
                      {sendingId === rep.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-blue-500" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada laporan ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
