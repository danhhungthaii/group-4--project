import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [editingUser, setEditingUser] = useState(null); // User đang sửa
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  // Lấy dữ liệu từ backend (MongoDB)
  useEffect(() => {
    axios
      .get("http://localhost:3000/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu:", err);
      });
  }, []);

  // Thêm user
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/users", newUser)
      .then((res) => {
        setUsers([...users, res.data]); // Cập nhật lại danh sách hiển thị
        setNewUser({ name: "", email: "" });
      })
      .catch((err) => {
        console.error("Lỗi khi thêm user:", err);
      });
  };

  // Xóa user
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/users/${id}`);
    setUsers(users.filter((user) => user._id !== id));
  };

  // Bắt đầu sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  // Lưu user đã sửa
  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await axios.put(
      `http://localhost:3000/users/${editingUser._id}`,
      editForm
    );
    setUsers(users.map((u) => (u._id === editingUser._id ? res.data : u)));
    setEditingUser(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách User</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email}
            <button
              onClick={() => handleEdit(u)}
              style={{ marginLeft: 8 }}
            >
              Sửa
            </button>
            <button
              onClick={() => handleDelete(u._id)}
              style={{ marginLeft: 4 }}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>

      <h2>Thêm User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <button type="submit">Thêm</button>
      </form>

      {editingUser && (
        <div>
          <h2>Sửa User</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
            <button type="submit">Lưu</button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              style={{ marginLeft: 4 }}
            >
              Hủy
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
