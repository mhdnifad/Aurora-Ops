"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRole = void 0;
const Membership_1 = __importDefault(require("../models/Membership"));
const errors_1 = require("../utils/errors");
const getUserRole = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const organizationId = req.headers['x-organization-id'];
        if (!organizationId) {
            throw new errors_1.AppError('Organization ID is required', 400);
        }
        const membership = await Membership_1.default.findOne({
            userId,
            organizationId,
            status: 'active',
        });
        if (!membership) {
            throw new errors_1.AppError('You are not a member of this organization', 403);
        }
        res.status(200).json({
            success: true,
            data: {
                role: membership.role,
                organizationId: membership.organizationId,
                userId: membership.userId,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserRole = getUserRole;
//# sourceMappingURL=membership.controller.js.map