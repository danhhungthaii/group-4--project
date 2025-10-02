import React, { useState } from "react";

function App() {
  // State lưu danh sách user
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com" },
  ]);

  // State cho form nhập
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Hàm thêm user
  const addUser = (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    const newUser = {
      id: users.length + 1,
      name: newName,
      email: newEmail,
    };
    setUsers([...users, newUser]);
    setNewName("");
    setNewEmail("");
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Danh sách User</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <b>{u.name}</b> - {u.email}
          </li>
        ))}
      </ul>

      <h3>Thêm User</h3>
      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Tên"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
}

export default App;
