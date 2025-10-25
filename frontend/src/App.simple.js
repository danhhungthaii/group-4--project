import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple components để test
function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>🎉 Frontend React - Group 4 Project</h1>
      <p>Deployed successfully on Vercel!</p>
      <div style={{ marginTop: '20px' }}>
        <Link 
          to="/login" 
          style={{ 
            padding: '12px 24px', 
            background: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            margin: '10px'
          }}
        >
          Go to Login
        </Link>
        <Link 
          to="/about" 
          style={{ 
            padding: '12px 24px', 
            background: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            margin: '10px'
          }}
        >
          About
        </Link>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Login Page</h2>
      <p>Redux + Protected Routes will be here</p>
      <Link to="/">← Back to Home</Link>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>About</h2>
      <p>Group 4 - Database Authentication Project</p>
      <p>React + Redux + Protected Routes</p>
      <Link to="/">← Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;