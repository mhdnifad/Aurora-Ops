"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
class Database {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            mongoose_1.default.set('strictQuery', false);
            await mongoose_1.default.connect(env_1.default.mongodb.uri);
            logger_1.default.info('✅ MongoDB connected successfully');
            // Handle connection events
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.default.error('MongoDB connection error:', error);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.default.warn('MongoDB disconnected');
            });
            // Graceful shutdown
            // Signal handler removed - handled in server.ts
            logger_1.default.info('✅ MongoDB connection established');
        }
        catch (error) {
            logger_1.default.error('❌ MongoDB connection failed:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        await mongoose_1.default.connection.close();
        logger_1.default.info('MongoDB connection closed');
    }
}
exports.default = Database.getInstance();
//# sourceMappingURL=database.js.map