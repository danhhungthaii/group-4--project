import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/profile")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Lỗi khi lấy thông tin:", err));
  }, []);

  const handleUpdate = () => {
    axios
      .put("http://localhost:5000/profile", user)
      .then(() => {
        alert("Cập nhật thành công!");
        setIsEditing(false);
      })
      .catch((err) => alert("Lỗi khi cập nhật thông tin: " + err));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">Thông tin cá nhân</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Họ tên:</label>
          <input
            type="text"
            value={user.name}
            disabled={!isEditing}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            value={user.email}
            disabled={!isEditing}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium">Số điện thoại:</label>
          <input
            type="text"
            value={user.phone}
            disabled={!isEditing}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div className="flex justify-between mt-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
