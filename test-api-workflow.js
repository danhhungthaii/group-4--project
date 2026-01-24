/* 
 * Simple JavaScript Test for Forgot Password API
 * Test workflow using fetch API
 */

const testAPI = async () => {
    console.log('🧪 Starting Forgot Password Workflow Test...\n');
    
    try {
        // Step 1: Request password reset
        console.log('📧 Step 1: Requesting password reset...');
        const forgotResponse = await fetch('http://localhost:5001/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com'
            })
        });
        
        const forgotResult = await forgotResponse.json();
        console.log('✅ Forgot Password Response:', forgotResult);
        
        if (!forgotResult.success) {
            console.error('❌ Failed at step 1');
            return;
        }
        
        // Step 2: Get last email
        console.log('\n📬 Step 2: Checking sent email...');
        const emailResponse = await fetch('http://localhost:5001/api/test/last-email');
        const emailResult = await emailResponse.json();
        console.log('📧 Last Email:', emailResult);
        
        if (!emailResult.success || !emailResult.resetToken) {
            console.error('❌ No reset token found');
            return;
        }
        
        const resetToken = emailResult.resetToken;
        console.log(`🔑 Reset Token: ${resetToken.substring(0, 20)}...`);
        
        // Step 3: Reset password with token
        console.log('\n🔒 Step 3: Resetting password...');
        const resetResponse = await fetch('http://localhost:5001/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: resetToken,
                newPassword: 'NewPassword123!'
            })
        });
        
        const resetResult = await resetResponse.json();
        console.log('✅ Reset Password Response:', resetResult);
        
        if (resetResult.success) {
            console.log('\n🎉 WORKFLOW TEST PASSED! ');
            console.log('✅ Email sent successfully');
            console.log('✅ Reset token generated');
            console.log('✅ Password changed successfully');
        } else {
            console.log('\n❌ WORKFLOW TEST FAILED at password reset');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
};

// Run test if in Node.js environment
if (typeof module !== 'undefined' && require.main === module) {
    testAPI();
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.testForgotPasswordAPI = testAPI;
}