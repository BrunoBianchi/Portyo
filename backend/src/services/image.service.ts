import sharp from 'sharp';
import redisClient from '../config/redis.client';
import { env } from '../config/env';

// Expiry time for images in Redis (in seconds) - e.g., 30 days
// Since this is a profile image, maybe we don't want it to expire easily? 
// Or maybe we depend on user activity. For now, let's keep it persistent or long-lived.
// Redis default is no expiry which is fine for "storage" simulation requested.
// But if we want to be safe, maybe 1 year? 31536000 seconds.
const IMAGE_TTL = 31536000; 

export const processProfileImage = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // 1. Generate Thumbnail (96x96) - PNG
    const thumbnailBuffer = await sharp(file.buffer)
        .resize(96, 96, { fit: 'cover' })
        .png({ quality: 80 })
        .toBuffer();

    // 2. Generate Medium (192x192) for Retina - PNG
    const mediumBuffer = await sharp(file.buffer)
        .resize(192, 192, { fit: 'cover' })
        .png({ quality: 80 })
        .toBuffer();

    // 3. Generate Original/Large (max 512x512) - PNG
    const originalBuffer = await sharp(file.buffer)
        .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
        .png({ quality: 85 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:photo:{size}
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:photo:thumbnail`, thumbnailBuffer, 'EX', IMAGE_TTL);
    pipeline.set(`user:${userId}:photo:medium`, mediumBuffer, 'EX', IMAGE_TTL);
    pipeline.set(`user:${userId}:photo:original`, originalBuffer, 'EX', IMAGE_TTL);
    
    await pipeline.exec();
        
    // Return backend URLs that point to the image serving endpoint
    // We return absolute URLs with .png extension
    const baseApiUrl = `${baseUrl}/api/images/${userId}`;
    return {
        thumbnail: `${baseApiUrl}/thumbnail.png`,
        medium: `${baseApiUrl}/medium.png`,
        original: `${baseApiUrl}/original.png`
    };
};

export const processBlogThumbnail = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate Blog Thumbnail (Landscape) - 1200x630 (OG standard)
    // We'll also generate a smaller one for the list view - 600x315
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    
    // List processing (smaller)
    const listBuffer = await sharp(file.buffer)
        .resize(600, 315, { fit: 'cover' })
        .png({ quality: 80 })
        .toBuffer();

    // Full processing (large)
    const fullBuffer = await sharp(file.buffer)
        .resize(1200, 630, { fit: 'cover', withoutEnlargement: true })
        .png({ quality: 85 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:blog:{timestamp}:list
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:blog:${timestamp}-${uniqueId}:list`, listBuffer, 'EX', 31536000); // 1 year
    pipeline.set(`user:${userId}:blog:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000);
    
    await pipeline.exec();
        
    // Return backend URL for the full image (can be used as thumbnail)
    // We could return both but for now the comprehensive requirement just asks for "thumbnail"
    // Let's return the full one as the main image, or we can create a specific route for serving blog images.
    // Given the existing pattern, let's stick to a simple path. 
    // Wait, the existing pattern uses /api/images/:userId/:type. We need to support dynamic blog image IDs.
    // We should probably create a new route /api/images/blog/:imageId
    
    const imageId = `${timestamp}-${uniqueId}`;
    return `${baseUrl}/api/images/blog/${userId}/${imageId}/full.png`;
};

export const processProductImage = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate Product Image - 800x800 square (good for storage and Stripe)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const fullBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'cover' })
        .png({ quality: 85 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:product:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:product:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const imageId = `${timestamp}-${uniqueId}`;
    return `${baseUrl}/api/images/product/${userId}/${imageId}/full.png`;
};

export const processBlockImage = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate Block Image - max 1200x1200 (responsive, good for full width or small items)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    // We use inside() to ensure it fits within the box without cropping, maintaining aspect ratio
    // But for block images, cover is often better if we want uniform shapes?
    // Actually, blocks can be anything (logos, tall images, wide images). 
    // Let's use `fit: inside` or `withoutEnlargement` to keep original aspect ratio but cap strictly at 1200px.
    const fullBuffer = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:block:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:block:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const imageId = `${timestamp}-${uniqueId}`;
    // We reuse the existing generic image route pattern if possible, or create a 'block' specific one.
    // Let's use /api/images/block/:userId/:imageId/full.png
    return `${baseUrl}/api/images/block/${userId}/${imageId}/full.png`;
};

export const processFavicon = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate Favicon - 512x512 square (handled nicely by browsers even if they need smaller)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const fullBuffer = await sharp(file.buffer)
        .resize(512, 512, { fit: 'cover' })
        .png({ quality: 90 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:favicon:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:favicon:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const imageId = `${timestamp}-${uniqueId}`;
    return `${baseUrl}/api/images/favicon/${userId}/${imageId}/full.png`;
};

export const processOgImage = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate OG Image - 1200x630 (Standard OG size)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const fullBuffer = await sharp(file.buffer)
        .resize(1200, 630, { fit: 'cover' })
        .png({ quality: 85 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:og:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:og:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const imageId = `${timestamp}-${uniqueId}`;
    return `${baseUrl}/api/images/og/${userId}/${imageId}/full.png`;
};

export const processPortfolioImage = async (buffer: Buffer, userId: string) => {
    // Generate Portfolio Image - 1200x800 (photography/portfolio showcase size)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const fullBuffer = await sharp(buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 90 })
        .toBuffer();

    // Store in Redis
    // Key format: user:{userId}:portfolio:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:portfolio:${timestamp}-${uniqueId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const imageId = `${timestamp}-${uniqueId}`;
    const baseUrl = env.BACKEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/images/portfolio/${userId}/${imageId}/full.png`;
};

export const processCustomFont = async (file: Express.Multer.File, userId: string, baseUrl: string) => {
    // Generate Font - just store it
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop() || 'ttf';

    // Store in Redis
    // Key format: user:{userId}:font:{timestamp}-{uniqueId}
    // We store the buffer directly
    const pipeline = redisClient.pipeline();
    pipeline.set(`user:${userId}:font:${timestamp}-${uniqueId}`, file.buffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    const fontId = `${timestamp}-${uniqueId}`;
    return `${baseUrl}/api/fonts/${userId}/${fontId}/${extension}`;
};


export const processBioLogoImage = async (file: Express.Multer.File, userId: string, bioId: string, baseUrl: string) => {
    // Generate Bio Logo - 512x512 square (same as profile image for consistency)
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const fullBuffer = await sharp(file.buffer)
        .resize(512, 512, { fit: 'cover' })
        .png({ quality: 90 })
        .toBuffer();

    // Store in Redis
    // Key format: bio:{bioId}:logo:{timestamp}-{uniqueId}:full
    const pipeline = redisClient.pipeline();
    const imageId = `${timestamp}-${uniqueId}`;
    pipeline.set(`bio:${bioId}:logo:${imageId}:full`, fullBuffer, 'EX', 31536000); // 1 year
    
    await pipeline.exec();
        
    return `${baseUrl}/api/images/bio-logo/${bioId}/${imageId}/full.png`;
};
