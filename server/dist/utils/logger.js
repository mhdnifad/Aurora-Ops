"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const env_1 = __importDefault(require("../config/env"));
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
// Create transports (console only for debugging)
const transports = [
    new winston_1.default.transports.Console({
        format: env_1.default.env === 'development' ? consoleFormat : logFormat,
    })
];
// Create logger
const logger = winston_1.default.createLogger({
    level: env_1.default.env === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports,
    exitOnError: false,
});
// (File-based exception/rejection handlers removed for debugging)
exports.default = logger;
//# sourceMappingURL=logger.js.map