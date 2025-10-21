import React, { useState, useEffect } from 'react';
import './UploadAvatar.css';

const UploadAvatar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Mock authentication - trong thực tế sẽ lấy từ context/redux
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Mock user data
      setCurrentUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar: localStorage.getItem('userAvatar') || null
      });
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)');
        setMessageType('error');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File ảnh không được vượt quá 5MB');
        setMessageType('error');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setMessage('');
    }
  };

  const uploadAvatar = async () => {
    if (!selectedFile) {
      setMessage('Vui lòng chọn file ảnh');
      setMessageType('error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Vui lòng đăng nhập trước');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Upload avatar thành công!');
        setMessageType('success');
        
        // Update user avatar
        const newAvatarUrl = data.user.avatar;
        setCurrentUser(prev => ({ ...prev, avatar: newAvatarUrl }));
        localStorage.setItem('userAvatar', newAvatarUrl);
        
        // Clear form
        setSelectedFile(null);
        setPreviewUrl(null);
        document.getElementById('avatarInput').value = '';
        
      } else {
        setMessage(`Lỗi upload: ${data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Lỗi kết nối: ${error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Vui lòng đăng nhập trước');
      setMessageType('error');
      return;
    }

    if (!currentUser?.avatar) {
      setMessage('Bạn chưa có avatar để xóa');
      setMessageType('error');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('http://localhost:5000/api/upload/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Xóa avatar thành công!');
        setMessageType('success');
        
        // Update user avatar
        setCurrentUser(prev => ({ ...prev, avatar: null }));
        localStorage.removeItem('userAvatar');
        
      } else {
        setMessage(`Lỗi xóa avatar: ${data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Lỗi kết nối: ${error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="upload-avatar-container">
        <div className="auth-required">
          <h3>⚠️ Yêu cầu đăng nhập</h3>
          <p>Vui lòng đăng nhập để sử dụng tính năng upload avatar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-avatar-container">
      <div className="upload-avatar-card">
        <h2>🖼️ Upload Avatar</h2>
        
        {/* Current Avatar */}
        <div className="current-avatar-section">
          <h3>Avatar hiện tại:</h3>
          <div className="avatar-display">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="Current Avatar"
                className="current-avatar-image"
              />
            ) : (
              <div className="no-avatar">
                <span>👤</span>
                <p>Chưa có avatar</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="avatarInput">Chọn ảnh avatar mới:</label>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <small className="file-info">
              Chấp nhận: JPG, JPEG, PNG, GIF, WEBP. Tối đa 5MB
            </small>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="preview-section">
              <h4>Preview ảnh sẽ upload:</h4>
              <div className="preview-image">
                <img src={previewUrl} alt="Preview" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={uploadAvatar}
              disabled={!selectedFile || uploading}
              className="upload-btn"
            >
              {uploading ? '⏳ Đang upload...' : '📤 Upload Avatar'}
            </button>
            
            <button
              onClick={deleteAvatar}
              disabled={!currentUser.avatar || uploading}
              className="delete-btn"
            >
              🗑️ Xóa Avatar
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="user-info">
          <h4>👤 Thông tin user:</h4>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UploadAvatar;