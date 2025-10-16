import React, { useState, useEffect } from "react";
import { getUsers, deleteUser } from "../api";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  // Load danh sách user
  const fetchUsers = () => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Lỗi khi lấy danh sách user:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xóa user
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      deleteUser(id)
        .then(() => {
          alert("Xóa thành công!");
          fetchUsers(); // Load lại danh sách
        })
        .catch((err) => alert("Lỗi khi xóa user: " + err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6">Quản lý User (Admin)</h2>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Họ tên</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Số điện thoại</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user._id}</td>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.phone || "-"}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4">
                Không có user nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
