declare class CloudinaryService {
    private enabled;
    constructor();
    /**
     * Check if Cloudinary is enabled
     */
    isEnabled(): boolean;
    /**
     * Upload file from buffer
     */
    uploadFile(fileBuffer: Buffer, options?: {
        folder?: string;
        publicId?: string;
        resourceType?: 'image' | 'video' | 'raw' | 'auto';
        transformation?: any;
    }): Promise<{
        url: string;
        secureUrl: string;
        publicId: string;
        format: string;
        width?: number;
        height?: number;
        bytes: number;
    }>;
    /**
     * Upload avatar image
     */
    uploadAvatar(fileBuffer: Buffer, userId: string): Promise<string>;
    /**
     * Upload project file
     */
    uploadProjectFile(fileBuffer: Buffer, fileName: string, projectId: string): Promise<{
        url: string;
        publicId: string;
        format: string;
        bytes: number;
    }>;
    /**
     * Upload task attachment
     */
    uploadTaskAttachment(fileBuffer: Buffer, fileName: string, taskId: string): Promise<{
        url: string;
        publicId: string;
        format: string;
        bytes: number;
    }>;
    /**
     * Delete file from Cloudinary
     */
    deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<void>;
    /**
     * Get file info
     */
    getFileInfo(publicId: string): Promise<any>;
    /**
     * Generate signed URL for private files
     */
    generateSignedUrl(publicId: string, expiresIn?: number): string;
}
declare const _default: CloudinaryService;
export default _default;
//# sourceMappingURL=cloudinary.service.d.ts.map