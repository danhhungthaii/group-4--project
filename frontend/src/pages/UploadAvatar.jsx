// src/pages/UploadAvatar.jsx
import React, { useState } from "react";
import { uploadAvatar } from "../api";

const UploadAvatar = () => {
  const [file, setFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Chọn file để upload");

    const formData = new FormData();
    formData.append("avatar", file);

    uploadAvatar(formData)
      .then((res) => {
        setAvatarUrl(res.data.url);
        alert("Upload thành công!");
      })
      .catch((err) => alert("Lỗi upload: " + err));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Avatar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </form>
      {avatarUrl && (
        <div className="mt-4">
          <h3 className="font-medium">Avatar hiện tại:</h3>
          <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full mt-2" />
        </div>
      )}
    </div>
  );
};

export default UploadAvatar;
