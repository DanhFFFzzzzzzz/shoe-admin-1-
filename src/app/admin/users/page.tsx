"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Định nghĩa kiểu dữ liệu người dùng
interface User {
  id: string;
  email: string;
  type: string;
  avatar_url: string;
  created_at: string;
  name: string;
  gender: string;
  address: string;
  phone: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({});
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm(user);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editUser ? "PUT" : "POST";
      // Chỉ truyền các trường có giá trị
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== undefined)
      );
      if (editUser) payload.id = editUser.id;
      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lỗi thao tác");
      setShowModal(false);
      fetchUsers();
    } catch {
      setError("Lỗi thao tác");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete.id }),
      });
      if (!res.ok) throw new Error("Lỗi xóa");
      setConfirmDelete(null);
      fetchUsers();
    } catch {
      setError("Lỗi xóa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>Thêm người dùng</Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Loại</th>
              <th className="py-2 px-4 border">Avatar</th>
              <th className="py-2 px-4 border">Ngày tạo</th>
              <th className="py-2 px-4 border">Tên</th>
              <th className="py-2 px-4 border">Giới tính</th>
              <th className="py-2 px-4 border">Địa chỉ</th>
              <th className="py-2 px-4 border">SĐT</th>
              <th className="py-2 px-4 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-4">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-4">Không có người dùng nào.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4 border">{user.id}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border">{user.type}</td>
                  <td className="py-2 px-4 border">
                    {user.avatar_url ? <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full mx-auto" /> : "-"}
                  </td>
                  <td className="py-2 px-4 border">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.gender}</td>
                  <td className="py-2 px-4 border">{user.address}</td>
                  <td className="py-2 px-4 border">{user.phone}</td>
                  <td className="py-2 px-4 border text-center">
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => openEdit(user)}>Sửa</Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(user)}>Xóa</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa người dùng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form className="bg-white p-6 rounded shadow w-full max-w-lg space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-2">{editUser ? "Sửa" : "Thêm"} người dùng</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Email</label>
                <input className="border p-2 rounded" placeholder="Email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Loại</label>
                <input className="border p-2 rounded" placeholder="Loại" value={form.type || ""} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Tên</label>
                <input className="border p-2 rounded" placeholder="Tên" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Giới tính</label>
                <input className="border p-2 rounded" placeholder="Giới tính" value={form.gender || ""} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Địa chỉ</label>
                <input className="border p-2 rounded" placeholder="Địa chỉ" value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">SĐT</label>
                <input className="border p-2 rounded" placeholder="SĐT" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-sm font-medium mb-1">Avatar URL</label>
                <input className="border p-2 rounded" placeholder="Avatar URL" value={form.avatar_url || ""} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button type="submit" disabled={loading}>{editUser ? "Lưu" : "Thêm"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận xóa người dùng</h2>
            <p>Bạn có chắc chắn muốn xóa người dùng <b>{confirmDelete.email}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>Xóa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 