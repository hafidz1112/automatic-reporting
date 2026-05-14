"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Search, Users, Check } from "lucide-react";
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
import { RadioHealthStore } from "@/components/input-data/radio-store";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type WaGroup = {
  id: string;
  groupId: string;
  name: string;
};

export default function InputDataPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [groups, setGroups] = useState<WaGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [searchGroup, setSearchGroup] = useState("");
  const debouncedSearch = useDebounce(searchGroup, 300);
  const { data: session } = useSession();

  const filteredGroups = debouncedSearch
    ? groups.filter((g) =>
        g.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : groups;

  const fetchGroups = async () => {
    setLoadingGroups(true);
    setGroupError(false);
    try {
      const res = await fetch("/api/group-wa?pageSize=100");
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      if (json.data) setGroups(json.data);
    } catch {
      setGroupError(true);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const onSubmitWA = async (values: ReportFormValues) => {
    if (!selectedGroupId) {
      toast.error("Pilih group WhatsApp tujuan terlebih dahulu");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Menyimpan dan mengirim laporan...");

    try {
      const saveResult = await saveReport(values, true);
      const reportId = saveResult.data.id;

      if (!reportId) {
        throw new Error("Report ID tidak ditemukan");
      }

      const waResponse = await fetch("/api/send-wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId })
      });

      if (!waResponse.ok) {
        let errorMessage = "Gagal mengirim ke WhatsApp Gateway";
        try {
          const errorResult = await waResponse.json();
          errorMessage = errorResult.error || errorMessage;
        } catch {
          /* ignore */
        }
        throw new Error(errorMessage);
      }

      if (selectedGroupId) {
        const groupRes = await fetch("/api/send-wa-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, groupId: selectedGroupId })
        });

        if (!groupRes.ok) {
          const groupErr = await groupRes.json();
          toast.error(
            `Laporan terkirim ke nomor telepon, tetapi gagal ke group: ${groupErr.error || "Unknown error"}`
          );
        } else {
          const groupResult = await groupRes.json();
          toast.success(
            `Laporan berhasil dikirim ke group ${groupResult.groupName}!`
          );
        }
      }

      toast.success("Laporan berhasil dikirim ke WhatsApp!", { id: toastId });
      reset();
      setSelectedGroupId("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengirim laporan";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSending(false);
    }
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
            <form className="columns-1 lg:columns-2 gap-6 space-y-6">
              <div className="break-inside-avoid">
                <RadioHealthStore />
              </div>
              <div className="break-inside-avoid">
                <SalesCard />
              </div>
              <div className="break-inside-avoid">
                <ShrinkageCard />
              </div>
              <div className="break-inside-avoid">
                <StockCard />
              </div>
              <div className="break-inside-avoid">
                <OosCard />
              </div>
              <div className="break-inside-avoid">
                <DistributionCard />
              </div>
              <div className="break-inside-avoid">
                <SupportCard />
              </div>
            </form>
          </main>

          <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 p-3 backdrop-blur md:p-4">
            <div className="mx-auto w-full max-w-4xl space-y-2">
              {loadingGroups ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Memuat daftar group...</span>
                </div>
              ) : groupError ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3">
                  <span className="text-sm text-red-500">Gagal memuat group</span>
                  <Button variant="outline" size="sm" onClick={fetchGroups}>
                    Muat Ulang
                  </Button>
                </div>
              ) : (
                <details className="rounded-lg border">
                  <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    {selectedGroupId
                      ? groups.find((g) => g.groupId === selectedGroupId)?.name
                      : "Pilih tujuan group WhatsApp"}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {groups.length} group
                    </span>
                  </summary>
                  <div className="border-t p-3">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari group..."
                        value={searchGroup}
                        onChange={(e) => setSearchGroup(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                      {filteredGroups.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            setSelectedGroupId(
                              selectedGroupId === g.groupId ? "" : g.groupId
                            )
                          }
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            selectedGroupId === g.groupId
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                              selectedGroupId === g.groupId
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {selectedGroupId === g.groupId && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <span className="truncate">{g.name}</span>
                        </button>
                      ))}
                      {filteredGroups.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Group tidak ditemukan
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              )}
              <Button
                onClick={handleSubmit(onSubmitWA)}
                disabled={isSending || !selectedGroupId}
                className="w-full rounded-md border-0 bg-emerald-600 px-4 text-white hover:bg-emerald-700 disabled:opacity-50 md:px-8"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {selectedGroupId ? "Submit & Send WA" : "Pilih group WA terlebih dahulu"}
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>
    </TooltipProvider>
  );
}
