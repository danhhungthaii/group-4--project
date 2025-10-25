/**
 * Rate Limiting Test Page
 * Test rate limiting và security features
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RateLimitingPage = () => {
  const navigate = useNavigate();
  
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, status, message, details = null) => {
    const result = {
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Normal Login Request
  const testNormalLogin = async () => {
    setIsLoading(true);
    addResult('Normal Login', 'info', 'Sending normal login request...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addResult('Normal Login', 'success', 'Login request successful', {
        responseTime: '150ms',
        rateLimit: '5 requests remaining'
      });
    } catch (error) {
      addResult('Normal Login', 'error', 'Login request failed', error.message);
    }
    setIsLoading(false);
  };

  // Test 2: Rapid Multiple Requests
  const testRapidRequests = async () => {
    setIsLoading(true);
    addResult('Rapid Requests', 'info', 'Sending 10 rapid requests...');
    
    const promises = [];
    for (let i = 1; i <= 10; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            if (i <= 5) {
              addResult(`Request ${i}`, 'success', `Request ${i}/10 successful`, {
                responseTime: `${100 + i * 20}ms`,
                rateLimit: `${5-i} requests remaining`
              });
            } else {
              addResult(`Request ${i}`, 'error', `Request ${i}/10 rate limited`, {
                error: 'Too Many Requests',
                retryAfter: '60 seconds'
              });
            }
            resolve();
          }, i * 200);
        })
      );
    }
    
    await Promise.all(promises);
    addResult('Rapid Requests', 'warning', 'Rate limiting activated after 5 requests');
    setIsLoading(false);
  };

  // Test 3: Brute Force Simulation
  const testBruteForce = async () => {
    setIsLoading(true);
    addResult('Brute Force', 'info', 'Simulating brute force attack...');
    
    const passwords = ['123456', 'password', 'admin', 'qwerty', 'correctpass'];
    
    for (let i = 0; i < passwords.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (i < 3) {
        addResult(`Attempt ${i+1}`, 'error', `Failed login with "${passwords[i]}"`, {
          attempts: i + 1,
          lockoutWarning: i === 2 ? 'Account will be locked after 2 more attempts' : null
        });
      } else if (i === 3) {
        addResult('Account Locked', 'error', 'Account temporarily locked due to too many failed attempts', {
          lockoutDuration: '15 minutes',
          securityAlert: 'Admin notified'
        });
        break;
      }
    }
    setIsLoading(false);
  };

  // Test 4: API Endpoints Load Test
  const testAPILoad = async () => {
    setIsLoading(true);
    addResult('API Load Test', 'info', 'Testing different endpoints...');
    
    const endpoints = [
      { name: '/api/profile', limit: 10, window: '1 minute' },
      { name: '/api/users', limit: 5, window: '1 minute' },
      { name: '/api/admin', limit: 3, window: '1 minute' },
      { name: '/api/logs', limit: 20, window: '1 minute' }
    ];

    for (const endpoint of endpoints) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const success = Math.random() > 0.3;
      if (success) {
        addResult(`${endpoint.name}`, 'success', `Endpoint test passed`, {
          limit: endpoint.limit,
          window: endpoint.window,
          current: Math.floor(Math.random() * endpoint.limit)
        });
      } else {
        addResult(`${endpoint.name}`, 'error', `Rate limit exceeded`, {
          limit: endpoint.limit,
          window: endpoint.window,
          retryAfter: '45 seconds'
        });
      }
    }
    setIsLoading(false);
  };

  // Test 5: IP Blocking Simulation
  const testIPBlocking = async () => {
    setIsLoading(true);
    addResult('IP Blocking', 'info', 'Simulating suspicious IP activity...');
    
    const suspiciousIPs = [
      '192.168.1.100',
      '10.0.0.50', 
      '203.0.113.25'
    ];

    for (const ip of suspiciousIPs) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (ip === '203.0.113.25') {
        addResult('IP Blocked', 'error', `IP ${ip} has been blocked`, {
          reason: 'Multiple failed login attempts',
          duration: '24 hours',
          country: 'Unknown'
        });
      } else {
        addResult('IP Check', 'success', `IP ${ip} is clean`, {
          reputation: 'Good',
          country: ip.startsWith('192') ? 'Local' : 'Domestic'
        });
      }
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getStatusClass = (status) => {
    return `result-item ${status}`;
  };

  return (
    <div className="rate-limiting-page">
      <div className="test-container">
        <div className="page-header">
          <h2>🛡️ Rate Limiting & Security Tests</h2>
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Quay lại Profile
          </button>
        </div>

        <div className="test-description">
          <p>🔒 Trang này mô phỏng các test bảo mật và rate limiting để kiểm tra khả năng chống tấn công của hệ thống.</p>
        </div>

        <div className="test-controls">
          <div className="test-buttons">
            <button 
              onClick={testNormalLogin} 
              disabled={isLoading}
              className="test-btn normal"
            >
              🔑 Test Normal Login
            </button>
            
            <button 
              onClick={testRapidRequests} 
              disabled={isLoading}
              className="test-btn warning"
            >
              ⚡ Test Rapid Requests
            </button>
            
            <button 
              onClick={testBruteForce} 
              disabled={isLoading}
              className="test-btn danger"
            >
              🔥 Test Brute Force
            </button>
            
            <button 
              onClick={testAPILoad} 
              disabled={isLoading}
              className="test-btn info"
            >
              📊 Test API Load
            </button>
            
            <button 
              onClick={testIPBlocking} 
              disabled={isLoading}
              className="test-btn error"
            >
              🚫 Test IP Blocking
            </button>
          </div>

          <div className="control-buttons">
            <button onClick={clearResults} className="clear-btn">
              🗑️ Clear Results
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Running security tests...</span>
          </div>
        )}

        <div className="results-section">
          <div className="results-header">
            <h3>📋 Test Results ({testResults.length})</h3>
          </div>
          
          <div className="results-list">
            {testResults.map(result => (
              <div key={result.id} className={getStatusClass(result.status)}>
                <div className="result-header">
                  <span className="result-icon">{getStatusIcon(result.status)}</span>
                  <span className="result-test">{result.test}</span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
                
                <div className="result-message">
                  {result.message}
                </div>
                
                {result.details && (
                  <div className="result-details">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {testResults.length === 0 && (
            <div className="empty-results">
              <p>🧪 Chưa có kết quả test nào. Hãy chọn một test để bắt đầu!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateLimitingPage;