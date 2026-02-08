import multer from 'multer';

// Use memory storage; files are handled by Cloudinary service
const memoryStorage = multer.memoryStorage();

// Allow up to 25MB to handle common image exports
export const uploadMemory = multer({ storage: memoryStorage, limits: { fileSize: 25 * 1024 * 1024 } });
