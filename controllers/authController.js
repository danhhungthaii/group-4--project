// Enhanced Authentication Controller với comprehensive features
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const emailService = require('../config/emailService');

// Generate JWT token với custom payload
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role?.name || user.role,
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'group4-project',
        audience: 'group4-users'
    });
};

// Generate refresh token
const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

class AuthController {
    // User Registration với enhanced validation
    static async register(req, res) {
        try {
            const { username, email, password, firstName, lastName, role = 'user' } = req.body;

            // Input validation
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email and password are required',
                    code: 'MISSING_FIELDS'
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    code: 'INVALID_EMAIL'
                });
            }

            // Password strength validation
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Check existing user
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: existingUser.email === email ? 'Email already exists' : 'Username already exists',
                    code: 'USER_EXISTS'
                });
            }

            // Validate role
            const roleDoc = await Role.findOne({ name: role });
            if (!roleDoc) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified',
                    code: 'INVALID_ROLE'
                });
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = new User({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: roleDoc._id,
                isActive: true,
                isEmailVerified: false,
                registrationDate: new Date()
            });

            // Generate email verification token
            const verificationToken = user.createEmailVerificationToken();
            await user.save();

            // Send verification email
            try {
                await emailService.sendVerificationEmail(email, verificationToken, {
                    firstName: firstName || username,
                    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
                });
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail registration if email fails
            }

            // Generate JWT token
            const token = generateToken(user);
            const refreshToken = generateRefreshToken();

            // Save refresh token (in production, store in database)
            user.refreshToken = refreshToken;
            await user.save();

            // Response without password
            const userResponse = {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: roleDoc.name,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                registrationDate: user.registrationDate
            };

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token,
                    refreshToken,
                    emailVerificationSent: true
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                code: 'REGISTRATION_ERROR'
            });
        }
    }

    // Enhanced Login với security features
    static async login(req, res) {
        try {
            const { email, password, rememberMe = false } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Find user với role population
            const user = await User.findOne({ 
                $or: [{ email }, { username: email }]
            }).populate('role', 'name permissions');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated',
                    code: 'ACCOUNT_DEACTIVATED'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                // Log failed attempt
                await User.findByIdAndUpdate(user._id, {
                    $inc: { 'security.failedLoginAttempts': 1 },
                    'security.lastFailedLogin': new Date()
                });

                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Check for account lockout (after 5 failed attempts)
            if (user.security?.failedLoginAttempts >= 5) {
                const lockoutTime = 15 * 60 * 1000; // 15 minutes
                const lastFailed = new Date(user.security.lastFailedLogin);
                const now = new Date();
                
                if (now.getTime() - lastFailed.getTime() < lockoutTime) {
                    return res.status(423).json({
                        success: false,
                        message: 'Account temporarily locked due to failed attempts',
                        code: 'ACCOUNT_LOCKED',
                        retryAfter: Math.ceil((lockoutTime - (now.getTime() - lastFailed.getTime())) / 1000)
                    });
                }
            }

            // Successful login - reset failed attempts
            await User.findByIdAndUpdate(user._id, {
                'security.failedLoginAttempts': 0,
                'security.lastLogin': new Date(),
                'security.loginCount': (user.security?.loginCount || 0) + 1
            });

            // Generate tokens
            const tokenExpiry = rememberMe ? '30d' : '7d';
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role.name
                },
                process.env.JWT_SECRET,
                { expiresIn: tokenExpiry }
            );

            const refreshToken = generateRefreshToken();
            
            // Save refresh token
            user.refreshToken = refreshToken;
            await user.save();

            // User response without sensitive data
            const userResponse = {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                permissions: user.role.permissions,
                isEmailVerified: user.isEmailVerified,
                lastLogin: new Date()
            };

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token,
                    refreshToken,
                    expiresIn: tokenExpiry
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                code: 'LOGIN_ERROR'
            });
        }
    }

    // Refresh token endpoint
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required',
                    code: 'REFRESH_TOKEN_REQUIRED'
                });
            }

            // Find user by refresh token
            const user = await User.findOne({ refreshToken }).populate('role', 'name permissions');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }

            // Generate new tokens
            const newToken = generateToken(user);
            const newRefreshToken = generateRefreshToken();

            // Update refresh token
            user.refreshToken = newRefreshToken;
            await user.save();

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: newToken,
                    refreshToken: newRefreshToken
                }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Token refresh failed',
                code: 'REFRESH_ERROR'
            });
        }
    }

    // Logout endpoint
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            
            if (refreshToken) {
                // Invalidate refresh token
                await User.findOneAndUpdate(
                    { refreshToken },
                    { $unset: { refreshToken: 1 } }
                );
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
                code: 'LOGOUT_ERROR'
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.userId)
                .populate('role', 'name permissions')
                .select('-password -refreshToken');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user }
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile',
                code: 'PROFILE_ERROR'
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All password fields are required',
                    code: 'MISSING_FIELDS'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New passwords do not match',
                    code: 'PASSWORD_MISMATCH'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Get current user
            const user = await User.findById(req.userId);

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Update password
            await User.findByIdAndUpdate(req.userId, {
                password: hashedNewPassword,
                'security.passwordChangedAt': new Date()
            });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                code: 'PASSWORD_CHANGE_ERROR'
            });
        }
    }
}

module.exports = AuthController;