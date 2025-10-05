import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

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

  // Xử lý thêm user
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách User</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email}
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
    </div>
  );
}

export default App;
