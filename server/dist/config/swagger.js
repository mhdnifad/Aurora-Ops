"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = __importDefault(require("./env"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Aurora Ops API Documentation',
            version: '1.0.0',
            description: 'Enterprise-grade real-time business operations platform API',
            contact: {
                name: 'Aurora Ops Team',
                email: 'support@auroraops.com',
                url: 'https://auroraops.com',
            },
            license: {
                name: 'Proprietary',
                url: 'https://auroraops.com/license',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.default.port}`,
                description: 'Development server',
            },
            {
                url: 'https://api.auroraops.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        firstName: {
                            type: 'string',
                            description: 'First name',
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email address',
                        },
                        avatar: {
                            type: 'string',
                            description: 'Avatar URL',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Organization: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                        slug: {
                            type: 'string',
                        },
                        plan: {
                            type: 'string',
                            enum: ['free', 'pro', 'enterprise'],
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        organizationId: {
                            type: 'string',
                        },
                        icon: {
                            type: 'string',
                        },
                        color: {
                            type: 'string',
                        },
                        archived: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Task: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        title: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in_progress', 'review', 'done'],
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                        },
                        projectId: {
                            type: 'string',
                        },
                        assigneeId: {
                            type: 'string',
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                            description: 'Response data',
                        },
                        message: {
                            type: 'string',
                            description: 'Success message',
                        },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ForbiddenError: {
                    description: 'User does not have permission to perform this action',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization',
            },
            {
                name: 'Organizations',
                description: 'Organization management',
            },
            {
                name: 'Projects',
                description: 'Project management',
            },
            {
                name: 'Tasks',
                description: 'Task management',
            },
            {
                name: 'Users',
                description: 'User management',
            },
            {
                name: 'Billing',
                description: 'Subscription and billing',
            },
            {
                name: 'AI',
                description: 'AI-powered features',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map