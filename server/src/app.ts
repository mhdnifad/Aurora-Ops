import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import config from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import logger from './utils/logger';
import cloudinaryService from './services/cloudinary.service';

// Import routes
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';
import billingRoutes from './routes/billing.routes';
import aiRoutes from './routes/ai.routes';
import contactRoutes from './routes/contact.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

class App {
  public app: Application;
  public server: HTTPServer;
  public io: SocketIOServer;
  private allowedOrigins: string[];

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.allowedOrigins = Array.from(
      new Set([
        config.frontendUrl,
        'http://localhost',
        'http://localhost:3000',
      ].filter(Boolean))
    );

    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: this.allowedOrigins,
        credentials: true,
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: config.env === 'production',
      crossOriginEmbedderPolicy: config.env === 'production',
    }));

    // CORS
    this.app.use(cors({
      origin: this.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // Explicitly allow custom org header for preflight checks
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-organization-id',
        'X-Organization-Id',
        'X-Requested-With',
      ],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    this.app.use(cookieParser());

    // Logging
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }

    // Trust proxy (for rate limiting with nginx)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Swagger API documentation
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Aurora Ops API Documentation',
    }));

    // Swagger JSON
    this.app.get('/api/docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // API routes
    this.app.get('/api', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Aurora Ops API v1.0',
        documentation: '/api/docs',
      });
    });

    this.app.get('/api/status', (_req, res) => {
      const uploadsEnabled = true;
      const uploadsProvider = cloudinaryService.isEnabled() ? 'cloudinary' : 'local';
      res.status(200).json({
        success: true,
        data: {
          uploads: {
            enabled: uploadsEnabled,
            provider: uploadsProvider,
          },
        },
      });
    });

    // Local uploads (fallback when Cloudinary is not configured)
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Register API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/organizations', organizationRoutes);
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/billing', billingRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/contact', contactRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/admin', adminRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public getServer(): HTTPServer {
    return this.server;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default App;
