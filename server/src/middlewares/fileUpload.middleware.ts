import multer from 'multer';

// Use memory storage; files are handled by Cloudinary service
const memoryStorage = multer.memoryStorage();

export const uploadMemory = multer({ storage: memoryStorage, limits: { fileSize: 10 * 1024 * 1024 } });
