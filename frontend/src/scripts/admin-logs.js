/* 
 * Admin Logs Dashboard JavaScript - SV2 Frontend
 * Complete functionality for user activity monitoring
 */

class AdminLogsManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 50;
        this.currentFilters = {};
        this.autoRefreshInterval = null;
        this.realTimeInterval = null;
        this.isRealTimeActive = false;
        
        // Charts
        this.actionsChart = null;
        this.dailyChart = null;
        
    // API Base URL (use relative path so it works with proxy or same-origin)
    this.apiUrl = '/api';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        console.log('🎛️ Admin Logs Manager initialized');
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.showTab(tab);
            });
        });

        // Auto-refresh checkbox
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', this.toggleAutoRefresh.bind(this));
        }

        // Page size change
        const pageSizeSelect = document.getElementById('page-size-select');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', this.changePageSize.bind(this));
        }
    }

    async loadInitialData() {
        try {
            await this.loadLogs();
            await this.loadStats();
            await this.loadSecurityData();
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            this.showNotification('Error loading data', 'error');
        }
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data for specific tabs
        switch(tabName) {
            case 'stats':
                this.loadStats();
                break;
            case 'security':
                this.loadSecurityData();
                break;
            case 'realtime':
                // Real-time tab loaded on demand
                break;
        }
    }

    async loadLogs() {
        this.showLoading(true);
        
        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                ...this.currentFilters
            });

            const response = await fetch(`${this.apiUrl}/logs/admin/all?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.displayLogs(data.data);
            this.updatePagination(data.pagination);
            this.updateLogsCount(data.pagination.totalLogs);

        } catch (error) {
            console.error('❌ Error loading logs:', error);
            this.displayError('Failed to load logs');
        } finally {
            this.showLoading(false);
        }
    }

    displayLogs(logs) {
        const tbody = document.getElementById('logs-table-body');
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No logs found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>
                    <div class="log-time">
                        ${this.formatDateTime(log.timestamp)}
                    </div>
                </td>
                <td>
                    <div class="user-info">
                        ${this.renderUserInfo(log.userId)}
                    </div>
                </td>
                <td>
                    <span class="action-badge ${this.getActionClass(log.action)}">
                        ${this.formatAction(log.action)}
                    </span>
                </td>
                <td>
                    <code>${log.ipAddress}</code>
                </td>
                <td>
                    <span class="status-badge ${log.success ? 'status-success' : 'status-failed'}">
                        <i class="fas ${log.success ? 'fa-check' : 'fa-times'}"></i>
                        ${log.success ? 'Success' : 'Failed'}
                    </span>
                </td>
                <td>
                    <div class="log-details">
                        ${this.renderLogDetails(log)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderUserInfo(user) {
        if (!user) {
            return `
                <div class="user-avatar">?</div>
                <span style="color: #7f8c8d;">Anonymous</span>
            `;
        }

        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        return `
            <div class="user-avatar">${initials}</div>
            <div>
                <div style="font-weight: 600;">${user.name || 'Unknown'}</div>
                <div style="font-size: 12px; color: #7f8c8d;">${user.email || ''}</div>
            </div>
        `;
    }

    getActionClass(action) {
        const actionMap = {
            'LOGIN_SUCCESS': 'action-login',
            'LOGIN_FAILED': 'action-failed',
            'LOGOUT': 'action-logout',
            'SIGNUP': 'action-signup',
            'UPLOAD_AVATAR': 'action-upload',
            'RATE_LIMITED': 'action-rate-limited'
        };
        return actionMap[action] || 'action-default';
    }

    formatAction(action) {
        return action.replace(/_/g, ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    renderLogDetails(log) {
        const details = log.details || {};
        const items = [];

        if (details.email) items.push(`Email: ${details.email}`);
        if (details.method) items.push(`Method: ${details.method}`);
        if (details.path) items.push(`Path: ${details.path}`);
        if (details.userAgent) items.push(`Browser: ${this.formatUserAgent(details.userAgent)}`);
        if (log.errorMessage) items.push(`Error: ${log.errorMessage}`);

        return items.length > 0 ? items.join('<br>') : '-';
    }

    formatUserAgent(userAgent) {
        if (!userAgent) return 'Unknown';
        
        // Simple browser detection
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        
        return userAgent.substring(0, 20) + '...';
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // If less than 1 hour ago, show relative time
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // Otherwise show date and time
        return date.toLocaleString('vi-VN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updatePagination(pagination) {
        document.getElementById('current-page').textContent = pagination.currentPage;
        document.getElementById('total-pages').textContent = pagination.totalPages;
        
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = !pagination.hasPrevPage;
        nextBtn.disabled = !pagination.hasNextPage;
    }

    updateLogsCount(total) {
        document.getElementById('logs-count').textContent = `${total} total logs`;
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}/logs/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.displayStats(data.data);

        } catch (error) {
            console.error('❌ Error loading stats:', error);
            this.displayStatsError();
        }
    }

    displayStats(stats) {
        // Update summary cards
        document.getElementById('total-logs-count').textContent = stats.summary.totalLogs || 0;
        document.getElementById('unique-users-count').textContent = stats.summary.uniqueUsers || 0;
        document.getElementById('unique-ips-count').textContent = stats.summary.uniqueIPs || 0;
        
        // Calculate failed attempts
        const failedAttempts = stats.actionStats.find(stat => stat._id === 'LOGIN_FAILED')?.count || 0;
        document.getElementById('failed-attempts-count').textContent = failedAttempts;

        // Update charts
        this.updateActionsChart(stats.actionStats);
        this.updateDailyChart(stats.dailyStats);
        this.updateTopIPs(stats.topIPs);
    }

    updateActionsChart(actionStats) {
        const ctx = document.getElementById('actions-chart').getContext('2d');
        
        if (this.actionsChart) {
            this.actionsChart.destroy();
        }

        const labels = actionStats.map(stat => this.formatAction(stat._id));
        const data = actionStats.map(stat => stat.count);
        const colors = this.generateColors(actionStats.length);

        this.actionsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateDailyChart(dailyStats) {
        const ctx = document.getElementById('daily-chart').getContext('2d');
        
        if (this.dailyChart) {
            this.dailyChart.destroy();
        }

        const labels = dailyStats.map(stat => {
            const date = new Date(stat._id);
            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
        });
        const successData = dailyStats.map(stat => stat.success);
        const failedData = dailyStats.map(stat => stat.failed);

        this.dailyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Successful',
                        data: successData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Failed',
                        data: failedData,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTopIPs(topIPs) {
        const container = document.getElementById('top-ips-list');
        
        if (!topIPs || topIPs.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No data available</p>';
            return;
        }

        container.innerHTML = topIPs.map(ip => `
            <div class="ip-item">
                <div>
                    <code>${ip._id}</code>
                    <div style="font-size: 12px; color: #7f8c8d;">
                        Actions: ${ip.actions.join(', ')}
                    </div>
                </div>
                <div style="font-weight: 600; color: #3498db;">
                    ${ip.count} requests
                </div>
            </div>
        `).join('');
    }

    async loadSecurityData() {
        try {
            // Load security-specific data
            const [securityLogs, rateLimitLogs] = await Promise.all([
                this.fetchSecurityLogs(),
                this.fetchRateLimitLogs()
            ]);

            this.displaySecurityData(securityLogs, rateLimitLogs);

        } catch (error) {
            console.error('❌ Error loading security data:', error);
        }
    }

    async fetchSecurityLogs() {
        const response = await fetch(`${this.apiUrl}/logs/admin/all?action=LOGIN_FAILED&limit=10`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok ? (await response.json()).data : [];
    }

    async fetchRateLimitLogs() {
        const response = await fetch(`${this.apiUrl}/logs/admin/all?action=RATE_LIMITED&limit=10`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok ? (await response.json()).data : [];
    }

    displaySecurityData(securityLogs, rateLimitLogs) {
        // Update alert cards
        document.getElementById('rate-limited-ips').textContent = 
            `${rateLimitLogs.length} IPs rate limited in last 24h`;
        
        document.getElementById('failed-login-count').textContent = 
            `${securityLogs.length} failed login attempts in last 24h`;

        // Update recent security events
        const eventsContainer = document.getElementById('security-events-list');
        const allEvents = [...securityLogs, ...rateLimitLogs]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        if (allEvents.length === 0) {
            eventsContainer.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No recent security events</p>';
            return;
        }

        eventsContainer.innerHTML = allEvents.map(event => `
            <div class="security-event">
                <div class="event-content">
                    <div>${this.formatAction(event.action)}</div>
                    <div class="event-time">${this.formatDateTime(event.timestamp)}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">IP: ${event.ipAddress}</div>
                </div>
                <span class="event-severity ${this.getEventSeverity(event.action)}">
                    ${this.getEventSeverity(event.action).replace('severity-', '')}
                </span>
            </div>
        `).join('');
    }

    getEventSeverity(action) {
        const severityMap = {
            'LOGIN_FAILED': 'severity-medium',
            'RATE_LIMITED': 'severity-high',
            'SIGNUP': 'severity-low'
        };
        return severityMap[action] || 'severity-low';
    }

    // Real-time monitoring
    startRealTimeMonitoring() {
        if (this.isRealTimeActive) return;

        this.isRealTimeActive = true;
        document.getElementById('start-monitor-btn').style.display = 'none';
        document.getElementById('stop-monitor-btn').style.display = 'inline-flex';
        document.getElementById('monitor-status').textContent = 'Active';
        document.getElementById('status-indicator').classList.add('active');

        // Poll for new logs every 5 seconds
        this.realTimeInterval = setInterval(() => {
            this.fetchRecentLogs();
        }, 5000);

        this.showNotification('Real-time monitoring started', 'success');
    }

    stopRealTimeMonitoring() {
        if (!this.isRealTimeActive) return;

        this.isRealTimeActive = false;
        document.getElementById('start-monitor-btn').style.display = 'inline-flex';
        document.getElementById('stop-monitor-btn').style.display = 'none';
        document.getElementById('monitor-status').textContent = 'Stopped';
        document.getElementById('status-indicator').classList.remove('active');

        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }

        this.showNotification('Real-time monitoring stopped', 'info');
    }

    async fetchRecentLogs() {
        try {
            const response = await fetch(`${this.apiUrl}/logs/admin/all?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.addRealTimeLogs(data.data);
            }
        } catch (error) {
            console.error('❌ Error fetching real-time logs:', error);
        }
    }

    addRealTimeLogs(logs) {
        const container = document.getElementById('realtime-logs-container');
        
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'realtime-log-entry';
            logEntry.innerHTML = `
                <span class="log-time">${this.formatDateTime(log.timestamp)}</span>
                <span class="log-action action-badge ${this.getActionClass(log.action)}">
                    ${this.formatAction(log.action)}
                </span>
                <span class="log-details">
                    ${log.userId?.name || 'Anonymous'} from ${log.ipAddress}
                </span>
            `;
            
            container.insertBefore(logEntry, container.firstChild);
        });

        // Keep only last 50 entries
        const entries = container.querySelectorAll('.realtime-log-entry');
        if (entries.length > 50) {
            for (let i = 50; i < entries.length; i++) {
                entries[i].remove();
            }
        }
    }

    clearRealTimeLogs() {
        document.getElementById('realtime-logs-container').innerHTML = '';
    }

    // Filter functions
    filterLogs() {
        const filters = {
            action: document.getElementById('action-filter')?.value || '',
            userId: document.getElementById('user-filter')?.value || '',
            ipAddress: document.getElementById('ip-filter')?.value || '',
            startDate: document.getElementById('date-start')?.value || '',
            endDate: document.getElementById('date-end')?.value || ''
        };

        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        this.currentFilters = filters;
        this.currentPage = 1;
        this.loadLogs();
    }

    clearFilters() {
        document.getElementById('action-filter').value = '';
        document.getElementById('user-filter').value = '';
        document.getElementById('ip-filter').value = '';
        document.getElementById('date-start').value = '';
        document.getElementById('date-end').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadLogs();
    }

    // Pagination functions
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadLogs();
        }
    }

    nextPage() {
        this.currentPage++;
        this.loadLogs();
    }

    changePageSize() {
        this.pageSize = parseInt(document.getElementById('page-size-select').value);
        this.currentPage = 1;
        this.loadLogs();
    }

    // Auto-refresh
    toggleAutoRefresh() {
        const checkbox = document.getElementById('auto-refresh');
        
        if (checkbox.checked) {
            this.autoRefreshInterval = setInterval(() => {
                this.loadLogs();
            }, 30000); // 30 seconds
            this.showNotification('Auto-refresh enabled (30s)', 'info');
        } else {
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
                this.autoRefreshInterval = null;
            }
            this.showNotification('Auto-refresh disabled', 'info');
        }
    }

    refreshLogs() {
        const btn = document.getElementById('refresh-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        this.loadLogs().finally(() => {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            btn.disabled = false;
        });
    }

    // Export functionality
    async exportLogs() {
        try {
            const queryParams = new URLSearchParams({
                limit: 1000, // Export more logs
                ...this.currentFilters
            });

            const response = await fetch(`${this.apiUrl}/logs/admin/all?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch logs for export');
            }

            const data = await response.json();
            this.downloadCSV(data.data);

        } catch (error) {
            console.error('❌ Error exporting logs:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    downloadCSV(logs) {
        const headers = ['Timestamp', 'User', 'Action', 'IP Address', 'Status', 'Details'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                `"${log.timestamp}"`,
                `"${log.userId?.name || 'Anonymous'}"`,
                `"${log.action}"`,
                `"${log.ipAddress}"`,
                `"${log.success ? 'Success' : 'Failed'}"`,
                `"${log.details?.email || ''} ${log.errorMessage || ''}".trim()`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Logs exported successfully', 'success');
    }

    // Utility functions
    generateColors(count) {
        const colors = [
            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
        ];
        return Array.from({length: count}, (_, i) => colors[i % colors.length]);
    }

    getAuthToken() {
        // In a real app, get from localStorage or similar
        return localStorage.getItem('authToken') || 'mock-admin-token';
    }

    showLoading(show) {
        const loadingEl = document.getElementById('logs-loading');
        const tableEl = document.querySelector('.table-container');
        
        if (show) {
            loadingEl.style.display = 'block';
            tableEl.style.opacity = '0.5';
        } else {
            loadingEl.style.display = 'none';
            tableEl.style.opacity = '1';
        }
    }

    displayError(message) {
        const tbody = document.getElementById('logs-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    ${message}
                </td>
            </tr>
        `;
    }

    displayStatsError() {
        document.getElementById('total-logs-count').textContent = 'Error';
        document.getElementById('unique-users-count').textContent = 'Error';
        document.getElementById('unique-ips-count').textContent = 'Error';
        document.getElementById('failed-attempts-count').textContent = 'Error';
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        }
    }
}

// Global functions for HTML onclick handlers
let adminManager;

function showTab(tabName) {
    adminManager.showTab(tabName);
}

function filterLogs() {
    adminManager.filterLogs();
}

function clearFilters() {
    adminManager.clearFilters();
}

function exportLogs() {
    adminManager.exportLogs();
}

function refreshLogs() {
    adminManager.refreshLogs();
}

function toggleAutoRefresh() {
    adminManager.toggleAutoRefresh();
}

function prevPage() {
    adminManager.prevPage();
}

function nextPage() {
    adminManager.nextPage();
}

function changePageSize() {
    adminManager.changePageSize();
}

function startRealTimeMonitoring() {
    adminManager.startRealTimeMonitoring();
}

function stopRealTimeMonitoring() {
    adminManager.stopRealTimeMonitoring();
}

function clearRealTimeLogs() {
    adminManager.clearRealTimeLogs();
}

function logout() {
    adminManager.logout();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminLogsManager();
});

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
