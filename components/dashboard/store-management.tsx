"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type Store = {
  id: string;
  name: string;
  type: string;
  location: string;
  operationalYear: number | null;
  targetSpd: number | null;
  createdAt: string;
};

export function StoreManagement() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "Bright Store",
    location: "",
    operationalYear: new Date().getFullYear(),
    targetSpd: 0
  });

  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming endpoint exists or needs creation
      const storesResult = await apiClient<Store[]>("/dashboard/stores");
      setStores(storesResult);
    } catch {
      setError("Gagal memuat daftar store. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleOpenAdd = () => {
    setEditingStoreId(null);
    setFormData({
      name: "",
      type: "Bright Store",
      location: "",
      operationalYear: new Date().getFullYear(),
      targetSpd: 0
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStoreId(store.id);
    setFormData({
      name: store.name,
      type: store.type,
      location: store.location,
      operationalYear: store.operationalYear || new Date().getFullYear(),
      targetSpd: store.targetSpd || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus store ${name}?`)) return;

    try {
      const res = await fetch(`/api/dashboard/stores?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Store berhasil dihapus.");
        loadStores();
      } else {
        toast.error(data.error || "Gagal menghapus store.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = "/api/dashboard/stores";
      const method = editingStoreId ? "PUT" : "POST";
      const body = editingStoreId
        ? { ...formData, id: editingStoreId }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingStoreId
            ? "Store berhasil diperbarui."
            : "Store berhasil ditambahkan."
        );
        setIsDialogOpen(false);
        loadStores();
      } else {
        toast.error(data.error || "Gagal menyimpan detail store.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Management Stores</CardTitle>
            <CardDescription>
              Total store terdaftar: {stores.length}
            </CardDescription>
          </div>
          <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Store
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Store</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Target SPD</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {store.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {store.location}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {store.type}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(store.targetSpd || 0)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(store)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(store.id, store.name)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {stores.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada store ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {editingStoreId ? "Edit Store" : "Tambah Store Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi store di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                <Label htmlFor="sname" className="text-left sm:text-right">
                  Nama Store
                </Label>
                <Input
                  id="sname"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="sm:col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                <Label htmlFor="slocation" className="text-left sm:text-right">
                  Lokasi
                </Label>
                <Input
                  id="slocation"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="sm:col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                <Label htmlFor="stype" className="text-left sm:text-right">
                  Tipe
                </Label>
                <Input
                  id="stype"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="sm:col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                <Label htmlFor="starget" className="text-left sm:text-right">
                  Target SPD
                </Label>
                <Input
                  id="starget"
                  type="number"
                  value={formData.targetSpd}
                  onChange={(e) =>
                    setFormData({ ...formData, targetSpd: parseInt(e.target.value) || 0 })
                  }
                  className="sm:col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingStoreId ? "Simpan Perubahan" : "Simpan Store"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
