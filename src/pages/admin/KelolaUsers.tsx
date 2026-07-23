import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Search,
  Users,
  User,
  Shield,
  Loader2,
  AlertTriangle,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  fetchUsers,
  fetchUserByEmail,
  insertUser,
  updateUser,
  deleteUserById,
} from "@/services/supabaseService";
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const ITEMS_PER_PAGE = 10;

export const KelolaUsers = () => {
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsersList(data);
    } catch (err) {
      toast.error("Gagal memuat data users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const paginatedDeletableUsers = useMemo(
    () => paginatedUsers.filter((u) => u.role !== "admin"),
    [paginatedUsers],
  );
  const allDeletableSelected =
    paginatedDeletableUsers.length > 0 &&
    paginatedDeletableUsers.every((u) => selectedIds.includes(u.id));
  const selectedDeletableCount = selectedIds.filter(
    (id) => usersList.find((u) => u.id === id)?.role !== "admin",
  ).length;

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      nama: "",
      email: "",
      password: "",
      role: "user",
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteUserById(id);
      setUsersList(usersList.filter((u) => u.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("User berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus user");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...new Set([
          ...prev,
          ...paginatedUsers.filter((u) => u.role !== "admin").map((u) => u.id),
        ]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedUsers.some((u) => u.id === id)),
      );
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const user = usersList.find((u) => u.id === id);
    if (!user || user.role === "admin") return;
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleBulkDelete = async () => {
    const deletableIds = selectedIds.filter((id) => {
      const user = usersList.find((u) => u.id === id);
      return user?.role !== "admin";
    });

    if (deletableIds.length === 0) {
      toast.error("Tidak ada user yang boleh dihapus");
      setDeleteBulkConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      await Promise.all(deletableIds.map((id) => deleteUserById(id)));
      setUsersList((prev) => prev.filter((u) => !deletableIds.includes(u.id)));
      setSelectedIds((prev) => prev.filter((id) => !deletableIds.includes(id)));
      toast.success("User terpilih berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus user terpilih");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteBulkConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!editingUser) {
        // Tambah User Baru
        const cleanEmail = formData.email.trim().toLowerCase();
        const existing = await fetchUserByEmail(cleanEmail);
        if (existing) {
          toast.error("Email tersebut sudah terdaftar dalam sistem");
          setSaving(false);
          return;
        }

        const newUser: UserType = {
          id: `u${Date.now()}`,
          nama: formData.nama.trim(),
          email: cleanEmail,
          password: formData.password,
          role: formData.role,
          created_at: new Date().toISOString(),
        };

        const created = await insertUser(newUser);
        setUsersList((prev) => [created, ...prev]);
        toast.success("User baru berhasil ditambahkan!");
      } else {
        // Edit User
        const updates: Partial<UserType> = {
          nama: formData.nama.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
        };
        if (formData.password.trim()) {
          updates.password = formData.password.trim();
        }

        const updated = await updateUser(editingUser.id, updates);
        setUsersList((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updated : u)),
        );
        toast.success("User berhasil diperbarui!");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Gagal menyimpan data user");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <User className="w-3 h-3" />
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
          <p className="text-gray-500">Manajemen data pengguna sistem</p>
        </div>
        <Button
          onClick={handleAddUser}
          className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {selectedDeletableCount > 0 ? (
            <Button
              variant="destructive"
              onClick={() => setDeleteBulkConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus {selectedDeletableCount} Terpilih
            </Button>
          ) : (
            <span className="text-sm text-gray-500">
              Pilih user untuk hapus massal
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {selectedIds.length} terpilih
        </div>
      </div>

      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={() => setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus User?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              User ini akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteBulkConfirm} onOpenChange={setDeleteBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus {selectedIds.length} User Terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              User yang dipilih akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <input
                    type="checkbox"
                    checked={allDeletableSelected}
                    disabled={paginatedDeletableUsers.length === 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-pink-600 rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Pilih semua pengguna yang dapat dihapus"
                  />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">
                  Tanggal Daftar
                </TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={(e) =>
                          handleSelectRow(user.id, e.target.checked)
                        }
                        disabled={user.role === "admin"}
                        className="h-4 w-4 text-pink-600 rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Pilih user ${user.nama} untuk dihapus`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500">
                      {new Date(
                        user.created_at || Date.now(),
                      ).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(user.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data user
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama lengkap..."
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password{" "}
                {editingUser && (
                  <span className="text-xs text-gray-400 font-normal">
                    (Kosongkan jika tidak ingin mengubah)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    editingUser ? "••••••••" : "Masukkan password..."
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  minLength={4}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Peran</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                <option value="user">User / Pengguna Biasa</option>
                <option value="admin">Admin / Pengelola System</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingUser ? "Simpan Perubahan" : "Tambah User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Statistik User</p>
        </div>
        <p className="text-sm text-green-700">
          Total Users: {usersList.length} | Admin:{" "}
          {usersList.filter((u) => u.role === "admin").length} | User Biasa:{" "}
          {usersList.filter((u) => u.role === "user").length}
        </p>
      </div>
    </div>
  );
};
