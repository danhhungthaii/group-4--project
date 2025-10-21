/* 
 * Frontend Authentication JavaScript - SV2 Work
 * Xử lý form validation và API calls cho forgot password system  
 */

class ForgotPasswordHandler {
    constructor() {
        this.apiUrl = 'http://localhost:5001/api';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Forgot Password Form
        const forgotForm = document.getElementById('forgot-password-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', this.handleForgotPassword.bind(this));
        }

        // Reset Password Form
        const resetForm = document.getElementById('reset-password-form');
        if (resetForm) {
            resetForm.addEventListener('submit', this.handleResetPassword.bind(this));
            
            // Real-time password validation
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', this.validatePassword.bind(this));
            }
            
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', this.validatePasswordMatch.bind(this));
            }
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value.trim();
        const submitBtn = form.querySelector('.btn');
        const messageDiv = document.getElementById('message');

        if (!this.validateEmail(email)) {
            this.showMessage('Vui lòng nhập địa chỉ email hợp lệ', 'error');
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        this.hideMessage();

        try {
            const response = await fetch(`${this.apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(
                    'Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.', 
                    'success'
                );
                form.reset();
            } else {
                this.showMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showMessage('Lỗi kết nối, vui lòng thử lại sau', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }

    async handleResetPassword(e) {
        e.preventDefault();
        
        const form = e.target;
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;
        const submitBtn = form.querySelector('.btn');
        const messageDiv = document.getElementById('message');
        
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            this.showMessage('Token không hợp lệ hoặc đã hết hạn', 'error');
            return;
        }

        if (!this.isPasswordValid(newPassword)) {
            this.showMessage('Mật khẩu không đáp ứng yêu cầu bảo mật', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showMessage('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        this.hideMessage();

        try {
            const response = await fetch(`${this.apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token, 
                    newPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(
                    'Mật khẩu đã được đổi thành công! Bạn có thể đăng nhập với mật khẩu mới.', 
                    'success'
                );
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            } else {
                this.showMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            this.showMessage('Lỗi kết nối, vui lòng thử lại sau', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }

    validatePassword(e) {
        const password = e.target.value;
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(requirement => {
            const element = document.querySelector(`[data-requirement="${requirement}"]`);
            if (element) {
                element.classList.remove('valid', 'invalid', 'pending');
                element.classList.add(requirements[requirement] ? 'valid' : 'invalid');
                
                const icon = element.querySelector('.requirement-icon');
                if (icon) {
                    icon.textContent = requirements[requirement] ? '✓' : '✗';
                }
            }
        });

        // Enable/disable submit button based on validation
        const submitBtn = document.querySelector('#reset-password-form .btn');
        const isValid = Object.values(requirements).every(req => req);
        
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }

        return isValid;
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword === '') {
            confirmInput.style.borderColor = '#e0e0e0';
            return;
        }

        if (newPassword === confirmPassword) {
            confirmInput.style.borderColor = '#28a745';
        } else {
            confirmInput.style.borderColor = '#dc3545';
        }
    }

    isPasswordValid(password) {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /\d/.test(password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
        }
    }

    hideMessage() {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ForgotPasswordHandler();
    
    // Display token info on reset page
    if (window.location.pathname.includes('reset')) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const tokenInfo = document.querySelector('.token-info');
        
        if (tokenInfo && token) {
            tokenInfo.innerHTML = `
                <strong>Token Reset:</strong> ${token.substring(0, 20)}...<br>
                <small>Token này sẽ hết hạn sau 1 giờ</small>
            `;
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForgotPasswordHandler;
}