import React, { useState } from "react";
import axios from "axios";

const AddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/users", { name, email })
      .then(res => {
        alert("Thêm user thành công!");
        setName("");
        setEmail("");
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Thêm User</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Tên" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
};

export default AddUser;
