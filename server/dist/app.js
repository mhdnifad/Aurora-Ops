"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = __importDefault(require("./config/env"));
const swagger_1 = require("./config/swagger");
const error_middleware_1 = require("./middlewares/error.middleware");
// import { apiLimiter } from './middlewares/rateLimit.middleware';
const logger_1 = __importDefault(require("./utils/logger"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
class App {
    app;
    server;
    io;
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: env_1.default.frontendUrl,
                credentials: true,
            },
        });
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        // Security middleware
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: env_1.default.env === 'production',
            crossOriginEmbedderPolicy: env_1.default.env === 'production',
        }));
        // CORS
        this.app.use((0, cors_1.default)({
            origin: env_1.default.frontendUrl,
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
        this.app.use((0, compression_1.default)());
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Cookie parser
        this.app.use((0, cookie_parser_1.default)());
        // Logging
        if (env_1.default.env === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
        }
        else {
            this.app.use((0, morgan_1.default)('combined', {
                stream: {
                    write: (message) => logger_1.default.info(message.trim()),
                },
            }));
        }
        // Rate limiting (disabled for development)
        // this.app.use('/api/', apiLimiter);
        // Trust proxy (for rate limiting with nginx)
        this.app.set('trust proxy', 1);
    }
    initializeRoutes() {
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
        this.app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Aurora Ops API Documentation',
        }));
        // Swagger JSON
        this.app.get('/api/docs.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swagger_1.swaggerSpec);
        });
        // API routes
        this.app.get('/api', (_req, res) => {
            res.status(200).json({
                success: true,
                message: 'Aurora Ops API v1.0',
                documentation: '/api/docs',
            });
        });
        // Register API routes
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/organizations', organization_routes_1.default);
        this.app.use('/api/projects', project_routes_1.default);
        this.app.use('/api/tasks', task_routes_1.default);
        this.app.use('/api/user', user_routes_1.default);
        this.app.use('/api/billing', billing_routes_1.default);
        this.app.use('/api/ai', ai_routes_1.default);
        this.app.use('/api/contact', contact_routes_1.default);
    }
    initializeErrorHandling() {
        // 404 handler
        this.app.use(error_middleware_1.notFoundHandler);
        // Global error handler
        this.app.use(error_middleware_1.errorHandler);
    }
    getServer() {
        return this.server;
    }
    getIO() {
        return this.io;
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map