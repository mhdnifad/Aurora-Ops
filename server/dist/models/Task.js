"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../config/constants");
const TaskSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
        type: String,
        enum: Object.values(constants_1.TASK_STATUS),
        default: constants_1.TASK_STATUS.TODO,
        index: true,
    },
    priority: {
        type: String,
        enum: Object.values(constants_1.TASK_PRIORITY),
        default: constants_1.TASK_PRIORITY.MEDIUM,
        index: true,
    },
    assigneeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    dueDate: {
        type: Date,
        default: null,
        index: true,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    tags: {
        type: [String],
        default: [],
    },
    attachments: [
        new mongoose_1.Schema({
            name: { type: String, required: true },
            url: { type: String, required: true },
            size: { type: Number, default: 0 },
            type: { type: String, default: 'application/octet-stream' },
            publicId: { type: String, default: null },
        }, { _id: true }),
    ],
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Compound indexes for efficient queries
TaskSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
TaskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, assigneeId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, dueDate: 1 });
// Text index for search
TaskSchema.index({ title: 'text', description: 'text' });
// Index for soft delete
TaskSchema.index({ deletedAt: 1 });
exports.default = mongoose_1.default.model('Task', TaskSchema);
//# sourceMappingURL=Task.js.map