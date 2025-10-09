// Đăng ký tài khoản
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });
    }

    // Ở đây bạn có thể dùng JWT, nhưng tạm trả về thông tin cơ bản
    res.json({ message: 'Đăng nhập thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server: ' + err.message });
  }
};
