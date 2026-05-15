"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, ExternalLink, MessageSquareText } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/layout/app-header";
import { reportSchema, ReportFormValues } from "@/lib/validations/report";
import { SalesCard } from "@/components/input-data/sales-card";
import { DistributionCard } from "@/components/input-data/distribution-card";
import { OosCard } from "@/components/input-data/oos-card";
import { StockCard } from "@/components/input-data/stock-card";
import { ShrinkageCard } from "@/components/input-data/shrinkage-card";
import { SupportCard } from "@/components/input-data/support-card";
import { signOut, useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default function InputDataPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewWaLink, setPreviewWaLink] = useState("");
  const [waTarget, setWaTarget] = useState("");
  const { data: session } = useSession();

  const methods = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as Resolver<ReportFormValues>,
    defaultValues: {
      salesGroceries: 0,
      salesLpg: 0,
      salesPelumas: 0,
      fulfillmentPb: 0,
      avgFulfillmentDc: 0,
      itemOos: [],
      isStoreHealthy: "store sehat",
      stockLpg3kg: 0,
      stockLpg5kg: 0,
      stockLpg12kg: 0,
      waste: 0,
      losses: 0,
      needSupport: ""
    }
  });

  const { handleSubmit, reset } = methods;

  const saveReport = async (
    values: ReportFormValues,
    isPushedToWa: boolean
  ) => {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, isPushedToWa })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Gagal menyimpan laporan");
    }
    return await response.json();
  };

  const onPreviewWA = async (values: ReportFormValues) => {
    setIsSending(true);
    const toastId = toast.loading(
      "Menyimpan dan menyiapkan preview WhatsApp..."
    );

    try {
      const saveResult = await saveReport(values, false);
      const reportId = saveResult.data.id;

      if (!reportId) {
        throw new Error("Report ID tidak ditemukan");
      }

      const waResponse = await fetch("/api/share-wa-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          target: waTarget.trim() || undefined
        })
      });

      if (!waResponse.ok) {
        let errorMessage = "Gagal menyiapkan preview WhatsApp";
        try {
          const errorResult = await waResponse.json();
          errorMessage = errorResult.error || errorMessage;
        } catch {
          /* ignore */
        }
        throw new Error(errorMessage);
      }

      const waResult = await waResponse.json();
      setPreviewMessage(waResult.message || "");
      setPreviewWaLink(waResult.waLink || "");
      setIsPreviewOpen(true);
      toast.success("Preview WhatsApp siap", { id: toastId });
      reset();
      setWaTarget("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyiapkan laporan";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const copyPreviewMessage = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      toast.success("Teks berhasil disalin");
    } catch {
      toast.error("Gagal menyalin teks");
    }
  };

  const openWaLink = () => {
    if (!previewWaLink) return;
    window.open(previewWaLink, "_blank", "noopener,noreferrer");
  };

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
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="min-h-screen bg-muted/30 pb-36 sm:pb-28 md:pb-24">
          <AppHeader
            session={session}
            isSigningOut={isSigningOut}
            onLogout={onLogout}
          />

          <main className="mx-auto mt-1 w-full max-w-7xl px-6 py-6 sm:px-4 md:mt-3 md:px-6 md:py-6 lg:px-8">
            <form className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-15">
              <SalesCard />
              <DistributionCard />
              <OosCard />
              <StockCard />
              <ShrinkageCard />
              <SupportCard />
            </form>
          </main>

          <div className="fixed bottom-0  left-0 right-0 z-20 border-t bg-background/95 p-3 backdrop-blur md:p-4">
            <div className="mx-auto w-full max-w-4xl space-y-3">
              <div className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Nomor tujuan WhatsApp opsional
                  </label>
                  <Input
                    value={waTarget}
                    onChange={(e) => setWaTarget(e.target.value)}
                    placeholder="62812xxxxxxx"
                    inputMode="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan jika hanya ingin preview dan salin teks. wa.me
                    tidak bisa langsung kirim ke grup, jadi untuk grup gunakan
                    tombol salin.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSubmit(onPreviewWA)}
                  disabled={isSending}
                  className="w-full rounded-md border-0 bg-emerald-600 px-4 text-white hover:bg-emerald-700 disabled:opacity-50 md:w-auto md:px-8"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquareText className="w-4 h-4 mr-2" />
                  )}
                  Simpan & Preview WA
                </Button>
              </div>
            </div>
          </div>

          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Preview pesan WhatsApp</DialogTitle>
                <DialogDescription>
                  Periksa teks terlebih dulu. Untuk grup WhatsApp, salin teks
                  lalu kirim manual karena wa.me tidak mendukung tujuan grup
                  langsung.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <ScrollArea className="h-105 rounded-md border">
                  <Textarea
                    readOnly
                    value={previewMessage}
                    className="min-h-105 resize-none border-0 bg-muted/30 font-mono text-xs leading-5"
                  />
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  Jika ingin kirim ke grup, gunakan tombol salin lalu tempel ke
                  chat grup secara manual.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPreviewMessage}
                >
                  <Copy className="h-4 w-4" />
                  Salin teks
                </Button>
                <Button
                  type="button"
                  onClick={openWaLink}
                  disabled={!previewWaLink}
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka WhatsApp
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </FormProvider>
    </TooltipProvider>
  );
}
