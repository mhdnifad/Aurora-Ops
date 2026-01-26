"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const logger_1 = __importDefault(require("../utils/logger"));
const stream_1 = require("stream");
class CloudinaryService {
    enabled = false;
    constructor() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (cloudName && apiKey && apiSecret) {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });
            this.enabled = true;
            logger_1.default.info('✅ Cloudinary Service initialized');
        }
        else {
            logger_1.default.warn('⚠️  Cloudinary not configured - file uploads disabled');
        }
    }
    /**
     * Check if Cloudinary is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Upload file from buffer
     */
    async uploadFile(fileBuffer, options = {}) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: options.folder || 'aurora-ops',
                public_id: options.publicId,
                resource_type: options.resourceType || 'auto',
                transformation: options.transformation,
            }, (error, result) => {
                if (error) {
                    logger_1.default.error('Cloudinary upload error:', error);
                    reject(error);
                }
                else if (result) {
                    logger_1.default.info(`File uploaded to Cloudinary: ${result.public_id}`);
                    resolve({
                        url: result.url,
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                    });
                }
            });
            const readableStream = stream_1.Readable.from(fileBuffer);
            readableStream.pipe(uploadStream);
        });
    }
    /**
     * Upload avatar image
     */
    async uploadAvatar(fileBuffer, userId) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        const result = await this.uploadFile(fileBuffer, {
            folder: 'aurora-ops/avatars',
            publicId: `avatar_${userId}_${Date.now()}`,
            resourceType: 'image',
            transformation: {
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                fetch_format: 'auto',
            },
        });
        return result.secureUrl;
    }
    /**
     * Upload project file
     */
    async uploadProjectFile(fileBuffer, fileName, projectId) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const result = await this.uploadFile(fileBuffer, {
            folder: `aurora-ops/projects/${projectId}`,
            publicId: `${Date.now()}_${sanitizedFileName}`,
            resourceType: 'auto',
        });
        return {
            url: result.secureUrl,
            publicId: result.publicId,
            format: result.format,
            bytes: result.bytes,
        };
    }
    /**
     * Upload task attachment
     */
    async uploadTaskAttachment(fileBuffer, fileName, taskId) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const result = await this.uploadFile(fileBuffer, {
            folder: `aurora-ops/tasks/${taskId}`,
            publicId: `${Date.now()}_${sanitizedFileName}`,
            resourceType: 'auto',
        });
        return {
            url: result.secureUrl,
            publicId: result.publicId,
            format: result.format,
            bytes: result.bytes,
        };
    }
    /**
     * Delete file from Cloudinary
     */
    async deleteFile(publicId, resourceType = 'image') {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        try {
            await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType });
            logger_1.default.info(`File deleted from Cloudinary: ${publicId}`);
        }
        catch (error) {
            logger_1.default.error('Error deleting file from Cloudinary:', error);
            throw error;
        }
    }
    /**
     * Get file info
     */
    async getFileInfo(publicId) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        try {
            const result = await cloudinary_1.v2.api.resource(publicId);
            return result;
        }
        catch (error) {
            logger_1.default.error('Error getting file info from Cloudinary:', error);
            throw error;
        }
    }
    /**
     * Generate signed URL for private files
     */
    generateSignedUrl(publicId, expiresIn = 3600) {
        if (!this.enabled) {
            throw new Error('Cloudinary service not configured');
        }
        const timestamp = Math.round(Date.now() / 1000) + expiresIn;
        return cloudinary_1.v2.url(publicId, {
            sign_url: true,
            type: 'authenticated',
            expires_at: timestamp,
        });
    }
}
exports.default = new CloudinaryService();
//# sourceMappingURL=cloudinary.service.js.map