import React from 'react';
import { Link } from 'react-router-dom';

// Simple fallback homepage for testing
function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 Frontend React đã deploy thành công!</h1>
      <p>Redux + Protected Routes đang hoạt động</p>
      <Link to="/login" style={{ 
        display: 'inline-block', 
        padding: '10px 20px', 
        background: '#007bff', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '5px' 
      }}>
        Đi tới trang Login
      </Link>
    </div>
  );
}

export default HomePage;