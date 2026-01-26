"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('STARTUP');
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("./config/env"));
const database_1 = __importDefault(require("./config/database"));
const redis_1 = __importDefault(require("./config/redis"));
const logger_1 = __importDefault(require("./utils/logger"));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});
// Initialize application
const startServer = async () => {
    try {
        // Connect to MongoDB
        await database_1.default.connect();
        // Connect to Redis (optional)
        try {
            await redis_1.default.connect();
        }
        catch (redisError) {
            logger_1.default.warn('⚠️  Redis connection failed. Server will continue without Redis caching.');
        }
        // Initialize Express app
        let app;
        let server;
        let io;
        try {
            app = new app_1.default();
            server = app.getServer();
            io = app.getIO();
        }
        catch (appError) {
            logger_1.default.error('Error initializing Express app:', appError);
            throw appError;
        }
        // Initialize Socket.IO
        io.on('connection', (socket) => {
            logger_1.default.info(`Client connected: ${socket.id}`);
            socket.on('disconnect', () => {
                logger_1.default.info(`Client disconnected: ${socket.id}`);
            });
        });
        // Start server
        const httpServer = server.listen(env_1.default.port, '0.0.0.0', () => {
            logger_1.default.info(`Server listening on port ${env_1.default.port}`);
            const redisStatus = redis_1.default.getIsEnabled() ? '✅  Connected' : '⚠️  Disabled';
            logger_1.default.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AURORA OPS - Server Started Successfully            ║
║                                                           ║
║   Environment: ${env_1.default.env.toUpperCase().padEnd(11)}                              ║
║   Port: ${env_1.default.port.toString().padEnd(11)}                                     ║
║   API URL: http://localhost:${env_1.default.port}                      ║
║   Frontend: ${env_1.default.frontendUrl.padEnd(45)} ║
║                                                           ║
║   MongoDB: ✅  Connected                                  ║
║   Redis: ${redisStatus.padEnd(16)}                          ║
║   Socket.IO: ✅  Running                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
            logger_1.default.info('Server is now listening and accepting connections');
        });
        // Handle server errors
        httpServer.on('error', (error) => {
            logger_1.default.error('Server error event:', error);
            if (error.code === 'EADDRINUSE') {
                logger_1.default.error(`Port ${env_1.default.port} is already in use`);
            }
            process.exit(1);
        });
        logger_1.default.info('Event handlers registered, server setup complete');
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger_1.default.info(`${signal} received. Starting graceful shutdown...`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                // Close database connections
                await database_1.default.disconnect();
                try {
                    await redis_1.default.disconnect();
                }
                catch (redisError) {
                    logger_1.default.warn('Error disconnecting Redis:', redisError);
                }
                logger_1.default.info('Database connections closed');
                logger_1.default.info('Server shutdown complete');
                process.exit(0);
            });
            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger_1.default.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };
        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason) => {
            logger_1.default.error('UNHANDLED REJECTION! Shutting down...', reason);
            server.close(() => {
                process.exit(1);
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
logger_1.default.info('Starting Aurora Ops server...');
startServer().catch((error) => {
    logger_1.default.error('Unhandled rejection in startServer:', error);
    process.exit(1);
});
// Keep the process alive
setInterval(() => {
    // NOP - just keep the event loop alive
}, 10000);
//# sourceMappingURL=server.js.map