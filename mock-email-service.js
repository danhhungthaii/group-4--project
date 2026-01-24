/* 
 * Mock Email Service for Testing - Hoạt động 4
 * Simulate email sending without real SMTP
 */

const fs = require('fs');
const path = require('path');

class MockEmailService {
    constructor() {
        this.sentEmails = [];
        this.logFile = path.join(__dirname, 'mock-emails.log');
    }

    async sendMail(mailOptions) {
        const mockEmail = {
            timestamp: new Date().toISOString(),
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            messageId: `mock-${Date.now()}@group4.test`
        };

        this.sentEmails.push(mockEmail);
        
        // Log to file for debugging
        const logEntry = `
=== MOCK EMAIL SENT ===
Time: ${mockEmail.timestamp}
From: ${mockEmail.from}
To: ${mockEmail.to}
Subject: ${mockEmail.subject}
Message ID: ${mockEmail.messageId}
HTML: ${mockEmail.html}
========================

`;
        
        fs.appendFileSync(this.logFile, logEntry);
        
        console.log(`📧 Mock Email Sent:`);
        console.log(`   To: ${mockEmail.to}`);
        console.log(`   Subject: ${mockEmail.subject}`);
        console.log(`   Message ID: ${mockEmail.messageId}`);
        
        return mockEmail;
    }

    getLastEmail() {
        return this.sentEmails[this.sentEmails.length - 1];
    }

    getAllEmails() {
        return this.sentEmails;
    }

    clearEmails() {
        this.sentEmails = [];
        if (fs.existsSync(this.logFile)) {
            fs.unlinkSync(this.logFile);
        }
    }

    extractResetLink(email) {
        if (!email || !email.html) return null;
        
        const linkMatch = email.html.match(/href="([^"]*reset-password[^"]*)"/);
        return linkMatch ? linkMatch[1] : null;
    }

    extractResetToken(email) {
        const link = this.extractResetLink(email);
        if (!link) return null;
        
        const tokenMatch = link.match(/token=([^&]*)/);
        return tokenMatch ? tokenMatch[1] : null;
    }
}

module.exports = new MockEmailService();