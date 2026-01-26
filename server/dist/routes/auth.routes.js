"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// import validateRequest } from '../middlewares/validation.middleware';
const router = express_1.default.Router();
/**
 * Public routes
 */
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
router.post('/verify-email', auth_controller_1.verifyEmail);
/**
 * Protected routes (require authentication)
 */
router.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.getCurrentUser);
router.post('/logout', auth_middleware_1.authenticateToken, auth_controller_1.logout);
router.post('/change-password', auth_middleware_1.authenticateToken, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map