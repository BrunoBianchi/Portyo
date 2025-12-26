import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../../../frontend/public/users-photos');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const processProfileImage = async (file: Express.Multer.File, userId: string) => {
    const filename = `${userId}`;
    
    // 1. Generate Thumbnail (96x96) - WebP
    await sharp(file.buffer)
        .resize(96, 96, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(UPLOAD_DIR, `${filename}-96.webp`));

    // 2. Generate Medium (192x192) for Retina - WebP
    await sharp(file.buffer)
        .resize(192, 192, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(UPLOAD_DIR, `${filename}-192.webp`));

    // 3. Generate Original/Large (max 512x512) - WebP
    await sharp(file.buffer)
        .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(UPLOAD_DIR, `${filename}.webp`));
        
    return {
        thumbnail: `/users-photos/${filename}-96.webp`,
        medium: `/users-photos/${filename}-192.webp`,
        original: `/users-photos/${filename}.webp`
    };
};
