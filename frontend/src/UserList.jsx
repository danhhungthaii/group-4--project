import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/users")   // đổi sang port backend của bạn
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Danh sách User</h2>
      <ul>
        {users.map((u, i) => (
          <li key={i}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
