"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
  storeName: string | null;
  createdAt: string;
  status: "Active" | "Blocked";
};

type UsersResponse = {
  users: User[];
  total: number;
};

export function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kasir"
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResult = await apiClient<UsersResponse>("/dashboard/users");
      setUsers(usersResult);
    } catch {
      setError("Gagal memuat daftar pengguna. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({ name: "", email: "", password: "", role: "kasir" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna ${name}?`)) return;
    
    try {
      const res = await fetch(`/api/dashboard/users?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Pengguna berhasil dihapus.");
        loadUsers();
      } else {
        toast.error(data.error || "Gagal menghapus pengguna.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const url = "/api/dashboard/users";
      const method = editingUserId ? "PUT" : "POST";
      const body = editingUserId ? { ...formData, id: editingUserId } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(editingUserId ? "Pengguna berhasil diperbarui." : "Pengguna berhasil ditambahkan.");
        setIsDialogOpen(false);
        loadUsers();
      } else {
        toast.error(data.error || "Gagal menyimpan detail pengguna.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !users) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error && !users) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-red-500">{error}</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Management Users</CardTitle>
            <CardDescription>Total pengguna: {users?.total ?? 0}</CardDescription>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users?.users ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                    <TableCell className="capitalize whitespace-nowrap">{user.role}</TableCell>
                    <TableCell className="whitespace-nowrap">{user.storeName ?? "-"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          user.status === "Active"
                            ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 whitespace-nowrap"
                            : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 whitespace-nowrap"
                        }
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(user.id, user.name)} title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada pengguna ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUserId ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
            <DialogDescription>
              {editingUserId ? "Ubah detail profil dan role pengguna di bawah ini." : "Isi form berikut untuk menambahkan kasir atau admin baru."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nama</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={!!editingUserId} // Disallow email change to avoid complexity, or allow it
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUserId ? "Kosongkan jika tidak ingin diubah" : "Password akun"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="col-span-3"
                  required={!editingUserId}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <div className="col-span-3">
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kasir">Kasir</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUserId ? "Simpan Perubahan" : "Simpan Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
