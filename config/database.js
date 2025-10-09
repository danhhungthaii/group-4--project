const mongoose = require('mongoose');

// Database configuration
const DB_CONFIG = {
    development: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/group4_database_dev',
        options: {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        }
    },
    production: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/group4_database_prod',
        options: {
            maxPoolSize: 100,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    test: {
        uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/group4_database_test',
        options: {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    }
};

class DatabaseConnection {
    constructor() {
        this.isConnected = false;
        this.environment = process.env.NODE_ENV || 'development';
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('Database đã được kết nối');
                return;
            }

            const config = DB_CONFIG[this.environment];
            
            await mongoose.connect(config.uri, config.options);
            
            this.isConnected = true;
            
            console.log(`✅ Kết nối MongoDB thành công!`);
            console.log(`📊 Database: ${config.uri}`);
            console.log(`🌍 Environment: ${this.environment}`);

            // Event listeners
            mongoose.connection.on('disconnected', () => {
                console.log('❌ MongoDB bị ngắt kết nối');
                this.isConnected = false;
            });

            mongoose.connection.on('error', (err) => {
                console.error('💥 Lỗi MongoDB:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB kết nối lại thành công');
                this.isConnected = true;
            });

        } catch (error) {
            console.error('💥 Lỗi kết nối MongoDB:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        try {
            if (!this.isConnected) {
                console.log('Database chưa được kết nối');
                return;
            }

            await mongoose.disconnect();
            this.isConnected = false;
            console.log('✅ Ngắt kết nối MongoDB thành công');
        } catch (error) {
            console.error('💥 Lỗi khi ngắt kết nối MongoDB:', error.message);
            throw error;
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

module.exports = {
    dbConnection,
    DB_CONFIG
};