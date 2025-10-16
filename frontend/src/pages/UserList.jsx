// src/pages/UserList.jsx
import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../api";

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Lỗi khi lấy danh sách user:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    deleteUser(id)
      .then(() => {
        alert("Xóa thành công!");
        fetchUsers();
      })
      .catch((err) => alert("Lỗi khi xóa user: " + err));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Danh sách người dùng</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Tên</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Số điện thoại</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="p-2 border">{user._id}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.phone}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
