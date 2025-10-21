// check-servers.js - Kiểm tra trạng thái servers
const http = require('http');

// Màu sắc cho console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function checkServer(port, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      console.log(`${colors.green}✅ ${name} server is RUNNING on port ${port}${colors.reset}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`${colors.red}❌ ${name} server is NOT running on port ${port}${colors.reset}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`${colors.yellow}⏰ ${name} server timeout on port ${port}${colors.reset}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkAllServers() {
  console.log(`${colors.blue}🔍 Checking server status...${colors.reset}\n`);
  
  const backendStatus = await checkServer(5000, 'Backend API');
  const staticStatus = await checkServer(3001, 'Static');
  
  console.log('');
  
  if (backendStatus && staticStatus) {
    console.log(`${colors.green}🎉 All servers are running! Demo is ready.${colors.reset}`);
    console.log('');
    console.log(`${colors.blue}📋 Demo URLs:${colors.reset}`);
    console.log('   - Backend API: http://localhost:5000');
    console.log('   - Demo Page:   http://localhost:3001/demo-refresh-token.html');
    console.log('');
    console.log(`${colors.blue}🔐 Test Accounts:${colors.reset}`);
    console.log('   - admin / password123');
    console.log('   - moderator / password456');
    console.log('   - user1 / password789');
  } else {
    console.log(`${colors.yellow}⚠️  Some servers are not running. Please start them:${colors.reset}`);
    if (!backendStatus) {
      console.log(`${colors.red}   - Backend: cd backend && node server-simple.js${colors.reset}`);
    }
    if (!staticStatus) {
      console.log(`${colors.red}   - Static: node static-server.js${colors.reset}`);
    }
    console.log('');
    console.log(`${colors.blue}💡 Quick fix: Run "start-demo.bat" to start all servers${colors.reset}`);
  }
}

checkAllServers().catch(console.error);