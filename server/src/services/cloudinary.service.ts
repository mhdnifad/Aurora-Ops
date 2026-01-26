import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger';
import { Readable } from 'stream';

class CloudinaryService {
  private enabled: boolean = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      this.enabled = true;
      logger.info('✅ Cloudinary Service initialized');
    } else {
      logger.warn('⚠️  Cloudinary not configured - file uploads disabled');
    }
  }

  /**
   * Check if Cloudinary is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Upload file from buffer
   */
  async uploadFile(
    fileBuffer: Buffer,
    options: {
      folder?: string;
      publicId?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: any;
    } = {}
  ): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
  }> {
    if (!this.enabled) {
      throw new Error('Cloudinary service not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'aurora-ops',
          public_id: options.publicId,
          resource_type: options.resourceType || 'auto',
          transformation: options.transformation,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
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
        }
      );

      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(fileBuffer: Buffer, userId: string): Promise<string> {
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
  async uploadProjectFile(
    fileBuffer: Buffer,
    fileName: string,
    projectId: string
  ): Promise<{
    url: string;
    publicId: string;
    format: string;
    bytes: number;
  }> {
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
  async uploadTaskAttachment(
    fileBuffer: Buffer,
    fileName: string,
    taskId: string
  ): Promise<{
    url: string;
    publicId: string;
    format: string;
    bytes: number;
  }> {
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
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    if (!this.enabled) {
      throw new Error('Cloudinary service not configured');
    }

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      logger.info(`File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(publicId: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('Cloudinary service not configured');
    }

    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error('Error getting file info from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL for private files
   */
  generateSignedUrl(publicId: string, expiresIn: number = 3600): string {
    if (!this.enabled) {
      throw new Error('Cloudinary service not configured');
    }

    const timestamp = Math.round(Date.now() / 1000) + expiresIn;
    
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      expires_at: timestamp,
    });
  }
}

export default new CloudinaryService();
