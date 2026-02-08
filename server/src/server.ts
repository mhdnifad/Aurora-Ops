

import App from './app';
import config from './config/env';
import database from './config/database';
import redis from './config/redis';
import logger from './utils/logger';
import SocketManager from './socket';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// Initialize application
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

    // Connect to Redis (optional)
    try {
      await redis.connect();
    } catch {
      logger.warn('⚠️  Redis connection failed. Server will continue without Redis caching.');
    }

    // Initialize Express app
    let app;
    let server;
    let io;
    try {
      app = new App();
      server = app.getServer();
      io = app.getIO();
    } catch (appError) {
      logger.error('Error initializing Express app:', appError);
      throw appError;
    }

    // Initialize Socket.IO
    new SocketManager(io);

    logger.info('About to call server.listen()...');
    logger.info(`Server type: ${typeof server}, listening: ${server.listening}`);

    // Start server
    const httpServer = server.listen(config.port, () => {
      logger.info(`Server listening callback fired on port ${config.port}`);
      logger.info(`httpServer.listening: ${httpServer.listening}, address: ${JSON.stringify(httpServer.address())}`);
      const redisStatus = redis.getIsEnabled() ? '✅  Connected' : '⚠️  Disabled';
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AURORA OPS - Server Started Successfully            ║
║                                                           ║
║   Environment: ${config.env.toUpperCase().padEnd(11)}                              ║
║   Port: ${config.port.toString().padEnd(11)}                                     ║
║   API URL: http://localhost:${config.port}                      ║
║   Frontend: ${config.frontendUrl.padEnd(45)} ║
║                                                           ║
║   MongoDB: ✅  Connected                                  ║
║   Redis: ${redisStatus.padEnd(16)}                          ║
║   Socket.IO: ✅  Running                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
      logger.info('Server is now listening and accepting connections');
    });

    // Handle server errors
    httpServer.on('error', (error: { code?: string; message?: string }) => {
      logger.error('Server error event:', error);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      }
      process.exit(1);
    });

    logger.info('Event handlers registered, server setup complete');
    logger.info(`After listen call - httpServer.listening: ${httpServer.listening}`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connections
        await database.disconnect();
        try {
          await redis.disconnect();
        } catch (err) {
          logger.warn('Error disconnecting Redis:', err);
        }

        logger.info('Database connections closed');
        logger.info('Server shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', reason);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
logger.info('Starting Aurora Ops server...');
startServer().catch((error) => {
  logger.error('Unhandled rejection in startServer:', error);
  process.exit(1);
});

// Keep the process alive
setInterval(() => {
  // NOP - just keep the event loop alive
}, 10000);
