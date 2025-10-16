// Simple in-memory storage for demo (in production, use database)
let users = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'password123' },
  { id: 2, name: 'Test User', email: 'user1@example.com', password: 'password456' }
];

// GET: lấy danh sách users
exports.getUsers = (req, res) => {
  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }))
  });
};

// POST: tạo user mới
exports.createUser = (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required'
    });
  }
  
  // Check if email exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
  }
  
  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    password 
  };
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
};

// PUT: cập nhật user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email
    }
  });
};

// DELETE: xóa user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.id != id);
  
  if (users.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  
  res.json({
    success: true,
    message: "User deleted successfully"
  });
};
